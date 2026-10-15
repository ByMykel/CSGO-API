#!/usr/bin/env python3
"""Build a validated API snapshot. Only the workflow commits or pushes it."""
from __future__ import annotations

import argparse
import hashlib
import gzip
import json
from pathlib import Path
import re
import shutil
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
LOCALES = "en zh-CN pt-BR ru es-ES bg cs da nl fi fr de el hu it ja ko es-MX no pl pt-PT ro sv zh-TW tr uk vi".split()
# Keep the user's successful manual batches and their order. No Thai or 'all'.
BATCHES = [
    ["pt-BR", "ru", "es-ES", "bg"],
    ["ro", "sv", "zh-TW"],
    ["cs"], ["da"], ["nl"], ["fi"],
    ["fr", "de"], ["el", "hu"], ["it"], ["ja", "ko"],
    ["es-MX"], ["no", "pl"], ["pt-PT"], ["tr"], ["uk", "vi"],
]
REPOSITORIES = {
    "upstream": "ByMykel/CSGO-API",
    "file-tracker": "ByMykel/counter-strike-file-tracker",
    "image-tracker": "ByMykel/counter-strike-image-tracker",
}
VALVE_NAMES = "english schinese brazilian russian spanish bulgarian czech danish dutch finnish french german greek hungarian italian japanese koreana latam norwegian polish portuguese romanian swedish tchinese thai turkish ukrainian vietnamese".split()
GITHUB_FILE_LIMIT = 100 * 1024 * 1024


def run(arguments, *, cwd=None, capture=False):
    result = subprocess.run([str(x) for x in arguments], cwd=cwd, check=True,
                            text=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def sha256_file(filename):
    digest = hashlib.sha256()
    with filename.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def dataset_digest(repository):
    """Detect edits, additions and missing files even if remote refs are unchanged."""
    return api_digest(repository / "public/api", allow_missing=True)


def api_digest(api, *, allow_missing=False, locales=None):
    digest = hashlib.sha256()
    for code in LOCALES if locales is None else locales:
        directory = api / code
        if not directory.is_dir() or directory.is_symlink():
            if allow_missing:
                return None
            raise RuntimeError(f"Missing or unsafe generated directory: {directory}")
        entries = sorted(directory.iterdir())
        if not entries:
            if allow_missing:
                return None
            raise RuntimeError(f"Empty generated directory: {directory}")
        for filename in entries:
            if (not filename.is_file() or filename.is_symlink()
                    or not (filename.name.endswith(".json") or filename.name == "all.json.gz")):
                if allow_missing:
                    return None
                raise RuntimeError(f"Unexpected generated file: {filename}")
            digest.update(f"{code}/{filename.name}\0".encode())
            digest.update(sha256_file(filename).encode())
    return digest.hexdigest()


def implementation_digest():
    digest = hashlib.sha256()
    for filename in sorted(HERE.iterdir()):
        if filename.suffix in {".py", ".mjs"} and not filename.name.startswith("test"):
            digest.update(filename.name.encode())
            digest.update(filename.read_bytes())
    return digest.hexdigest()


def read_json(filename, default=None):
    try:
        return json.loads(filename.read_text())
    except FileNotFoundError:
        return default


def write_json(filename, value):
    filename.parent.mkdir(parents=True, exist_ok=True)
    filename.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def remote_commit(name):
    response = run(["git", "ls-remote", f"https://github.com/{name}.git", "refs/heads/main"], capture=True)
    lines = response.splitlines()
    if len(lines) != 1 or not re.fullmatch(r"[0-9a-f]{40}\s+refs/heads/main", lines[0]):
        raise RuntimeError(f"Cannot resolve exactly one main commit for {name}")
    return lines[0].split()[0]


def snapshot(root, key, commit):
    """Fetch one exact public commit; verify Git objects and safely export files."""
    git_dir = root / f"{key}.git"
    target = root / key
    run(["git", "init", "--bare", "--quiet", git_dir])
    run(["git", "--git-dir", git_dir, "remote", "add", "origin",
         f"https://github.com/{REPOSITORIES[key]}.git"])
    run(["git", "--git-dir", git_dir, "config", "remote.origin.promisor", "true"])
    run(["git", "--git-dir", git_dir, "config", "remote.origin.partialclonefilter", "blob:none"])
    run(["git", "--git-dir", git_dir, "-c", "fetch.fsckObjects=true", "fetch", "--quiet",
         "--depth=1", "--filter=blob:none", "origin", commit])
    actual = run(["git", "--git-dir", git_dir, "rev-parse", "FETCH_HEAD^{commit}"], capture=True)
    if actual != commit:
        raise RuntimeError(f"Fetched commit differs for {key}")
    paths = {
        "upstream": ["constants.js", "update.js", "group.js", "package.json", "package-lock.json",
                     "services", "utils", "public/api/en", "public/api/zh-CN"],
        "file-tracker": ["static/items_game.json", "static/manifestId.txt",
                         *[f"static/csgo_{name}.json" for name in VALVE_NAMES]],
        "image-tracker": ["static/images.json", "static/default_generated.json"],
    }[key]
    archive = root / f"{key}.tar"
    with archive.open("wb") as stream:
        subprocess.run(["git", "--git-dir", str(git_dir), "archive", commit, *paths],
                       stdout=stream, check=True)
    target.mkdir()
    with tarfile.open(archive) as tar:
        # Python >=3.12's data filter rejects path traversal and unsafe symlinks.
        tar.extractall(target, filter="data")
    archive.unlink()
    shutil.rmtree(git_dir)
    return target


def check_repository(repository):
    if not (repository / "constants.js").is_file() or not (repository / "public/api/en").is_dir():
        raise RuntimeError("Target is not a CSGO-API checkout; refusing to change it")
    for code in LOCALES:
        target = repository / "public/api" / code
        if target.is_symlink():
            raise RuntimeError(f"Refusing a symlink at {target}")
    # A fresh Actions checkout passes; local modifications need preserving first.
    status = run(["git", "status", "--porcelain", "--untracked-files=all", "--",
                  *[f"public/api/{code}" for code in LOCALES],
                  "fork-locales/state.json", "fork-locales/last-run.json", "fork-locales/heartbeat.json"],
                 cwd=repository, capture=True)
    if status:
        raise RuntimeError("Managed API/state paths have local changes; commit or preserve them before running")


def heartbeat(repository):
    # A monthly committed heartbeat supplies activity when inputs never change.
    write_json(repository / "fork-locales/heartbeat.json", {
        "month_utc": datetime.now(timezone.utc).strftime("%Y-%m"),
        "purpose": "Periodic repository activity while scheduled synchronization is healthy",
    })


def prepare_for_publication(api, mode, *, file_limit=GITHUB_FILE_LIMIT, locales=None):
    """Compress oversized generated all.json according to the publishing policy."""
    compressed = []
    candidates = []
    for code in LOCALES if locales is None else locales:
        for filename in sorted((api / code).iterdir()):
            if filename.stat().st_size >= file_limit:
                if mode != "gzip" or code in {"en", "zh-CN"} or filename.name != "all.json":
                    raise RuntimeError(f"{filename} exceeds GitHub's file limit; no permitted publishing format")
                if filename.with_suffix(".json.gz").exists():
                    raise RuntimeError(f"Refusing to overwrite an existing compressed output for {code}")
                candidates.append((code, filename))
    for code, filename in candidates:
        before = sha256_file(filename)
        target = filename.with_suffix(".json.gz")
        with filename.open("rb") as stream, target.open("xb") as destination:
            with gzip.GzipFile(filename="", fileobj=destination, mode="wb", mtime=0, compresslevel=9) as encoder:
                shutil.copyfileobj(stream, encoder, length=1024 * 1024)
        digest = hashlib.sha256()
        with gzip.open(target, "rb") as decoder:
            for block in iter(lambda: decoder.read(1024 * 1024), b""):
                digest.update(block)
        if digest.hexdigest() != before or target.stat().st_size >= file_limit:
            raise RuntimeError(f"Compressed output verification or size check failed for {code}")
        compressed.append({"locale": code, "file": "all.json.gz", "uncompressed_sha256": before,
                           "uncompressed_bytes": filename.stat().st_size, "compressed_bytes": target.stat().st_size})
        filename.unlink()
    return compressed


def validate_batches(batches):
    flat = [code for batch in batches for code in batch]
    expected = set(LOCALES) - {"en", "zh-CN"}
    if not batches or any(not batch for batch in batches):
        raise RuntimeError("Every generation batch must be nonempty")
    if len(flat) != len(set(flat)) or set(flat) != expected:
        raise RuntimeError("Batches must cover every configured extra locale exactly once, excluding en/zh-CN/th")


def promote_locales(source_api, target_api, locales):
    """Move validated output within the local runner; publishing happens later."""
    target_api.mkdir(parents=True, exist_ok=True)
    for code in locales:
        source = source_api / code
        target = target_api / code
        if not source.is_dir() or source.is_symlink() or target.is_symlink():
            raise RuntimeError(f"Missing or unsafe locale promotion: {code}")
    for code in locales:
        target = target_api / code
        if target.exists():
            shutil.rmtree(target)
        shutil.move(str(source_api / code), str(target))


def build_batches(source, file_tracker, image_tracker, work_root, target_api, mode, report_dir):
    """A fresh process for each small batch limits memory and temporary disk use."""
    validate_batches(BATCHES)
    compression = []
    results = []
    for number, batch in enumerate(BATCHES, start=1):
        label = f"batch-{number:02d}"
        staging = work_root / label
        batch_reports = report_dir / label
        batch_reports.mkdir(parents=True, exist_ok=True)
        print(f"[{number}/{len(BATCHES)}] Generate and validate: {','.join(batch)}", flush=True)
        try:
            run(["node", "--max-old-space-size=4096", "--unhandled-rejections=strict",
                 HERE / "generate.mjs", "--source", source, "--output", staging,
                 "--languages", ",".join(batch), "--file-tracker", file_tracker,
                 "--image-tracker", image_tracker])
            run(["node", "--max-old-space-size=4096", HERE / "validate.mjs",
                 "--output", staging, "--reference", source, "--languages", ",".join(batch),
                 "--file-tracker", file_tracker, "--oversized-all", mode,
                 "--report", batch_reports / "validation-report.json"])
            selected = ["en", "zh-CN", *batch]
            compressed = prepare_for_publication(staging / "api", mode, locales=selected)
            compression.extend(compressed)
            promote_locales(staging / "api", target_api, selected if number == 1 else batch)
            results.append({"batch": number, "languages": batch, "status": "validated"})
            write_json(batch_reports / "publication-format.json", {"compressed": compressed})
        finally:
            if (staging / "generation-report.json").is_file():
                shutil.copy2(staging / "generation-report.json", batch_reports / "generation-report.json")
            if staging.exists():
                shutil.rmtree(staging)
    return {"batches": results, "compressed_combined_files": compression}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repository", type=Path, default=Path.cwd())
    parser.add_argument("--report-dir", type=Path, required=True)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--check-only", action="store_true", help="Validate without changing the fork checkout")
    parser.add_argument("--oversized-all", choices=["reject", "gzip"], default="gzip",
                        help="Publishing policy for oversized generated combined files (default: gzip)")
    args = parser.parse_args()
    validate_batches(BATCHES)
    repository = args.repository.resolve()
    report_dir = args.report_dir.resolve()
    report_dir.mkdir(parents=True, exist_ok=True)
    check_repository(repository)
    commits = {key: remote_commit(name) for key, name in REPOSITORIES.items()}
    implementation = implementation_digest()
    old = read_json(repository / "fork-locales/state.json", {})
    if (not args.force and old.get("sources") == commits and old.get("implementation") == implementation
            and old.get("oversized_all", "reject") == args.oversized_all
            and old.get("dataset_sha256") == dataset_digest(repository) and old.get("dataset_sha256")):
        print("All three source commits and every API file are unchanged.", flush=True)
        write_json(report_dir / "result.json", {"status": "unchanged", "sources": commits})
        if not args.check_only:
            heartbeat(repository)
        return

    with tempfile.TemporaryDirectory(prefix="csgo-batched-locales-") as directory:
        root = Path(directory)
        snapshots = {key: snapshot(root, key, commit) for key, commit in commits.items()}
        source = snapshots["upstream"]
        run(["npm", "ci", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund",
             "--cache", root / "npm-cache"], cwd=source)
        run(["node", HERE / "audit-sources.mjs", "--source", source,
             "--file-tracker", snapshots["file-tracker"],
             "--report", report_dir / "source-audit.json"])
        # During a normal run use the checkout as local staging, replacing only
        # validated small batches. A failure leaves GitHub untouched because the
        # workflow's sole commit/push step runs only after this script succeeds.
        # --check-only instead materializes output entirely in temporary storage.
        target_api = root / "check-output" if args.check_only else repository / "public/api"
        batches = build_batches(source, snapshots["file-tracker"], snapshots["image-tracker"],
                                root, target_api, args.oversized_all, report_dir)
        digest = api_digest(target_api)
        result = {"status": "validated", "sources": commits, "dataset_sha256": digest,
                  "locales": LOCALES, **batches,
                  "spelling_certified": False}
        write_json(report_dir / "result.json", result)
        if args.check_only:
            print("Validation complete; --check-only left the fork unchanged.", flush=True)
            return
        write_json(repository / "fork-locales/state.json", {
            "sources": commits, "implementation": implementation, "dataset_sha256": digest,
            "oversized_all": args.oversized_all,
        })
        write_json(repository / "fork-locales/last-run.json", result)
        heartbeat(repository)
        print("Validated all 27 locales in 15 batches; prepared changes for one atomic Git commit.", flush=True)


if __name__ == "__main__":
    main()
