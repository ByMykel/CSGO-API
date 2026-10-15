import gzip
import json
from pathlib import Path
import tempfile
import unittest

from sync import BATCHES, LOCALES, api_digest, prepare_for_publication, promote_locales, validate_batches


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.api = Path(self.temp.name) / "api"
        for locale in LOCALES:
            directory = self.api / locale
            directory.mkdir(parents=True)
            (directory / "all.json").write_text("{}")
        self.payload = json.dumps({"item": "ของที่ระลึก" * 300}, ensure_ascii=False).encode()

    def oversized(self, locale="bg", filename="all.json"):
        target = self.api / locale / filename
        target.write_bytes(self.payload)
        return target

    def test_gzip_preserves_unicode_json_and_is_deterministic(self):
        target = self.oversized()
        result = prepare_for_publication(self.api, "gzip", file_limit=256)
        compressed = target.with_suffix(".json.gz")
        self.assertFalse(target.exists())
        self.assertEqual(gzip.decompress(compressed.read_bytes()), self.payload)
        first_bytes = compressed.read_bytes()
        self.assertEqual(result[0]["locale"], "bg")
        self.assertEqual(result[0]["uncompressed_bytes"], len(self.payload))
        compressed.unlink()
        target.write_bytes(self.payload)
        prepare_for_publication(self.api, "gzip", file_limit=256)
        self.assertEqual(compressed.read_bytes(), first_bytes)

    def test_explicit_rejection_does_not_change_oversized_file(self):
        target = self.oversized()
        with self.assertRaisesRegex(RuntimeError, "file limit"):
            prepare_for_publication(self.api, "reject", file_limit=256)
        self.assertEqual(target.read_bytes(), self.payload)
        self.assertFalse(target.with_suffix(".json.gz").exists())

    def test_gzip_never_changes_authoritative_or_category_files(self):
        for locale, filename in [("en", "all.json"), ("zh-CN", "all.json"), ("bg", "skins.json")]:
            with self.subTest(locale=locale, filename=filename):
                target = self.oversized(locale, filename)
                with self.assertRaisesRegex(RuntimeError, "file limit"):
                    prepare_for_publication(self.api, "gzip", file_limit=256)
                self.assertEqual(target.read_bytes(), self.payload)
                target.write_text("{}")

    def test_existing_compressed_output_is_preserved(self):
        target = self.oversized()
        compressed = target.with_suffix(".json.gz")
        compressed.write_bytes(b"existing")
        with self.assertRaisesRegex(RuntimeError, "overwrite"):
            prepare_for_publication(self.api, "gzip", file_limit=256)
        self.assertEqual(compressed.read_bytes(), b"existing")
        self.assertEqual(target.read_bytes(), self.payload)

    def test_output_drift_is_detected_for_compressed_files(self):
        target = self.oversized()
        prepare_for_publication(self.api, "gzip", file_limit=256)
        before = api_digest(self.api)
        compressed = target.with_suffix(".json.gz")
        compressed.write_bytes(compressed.read_bytes() + b"drift")
        self.assertNotEqual(api_digest(self.api), before)

    def test_batch_coverage_rejects_missing_duplicate_and_unrequested_locales(self):
        validate_batches(BATCHES)
        invalid = [BATCHES[:-1], [*BATCHES, ["fr"]], [*BATCHES[:-1], ["uk", "th"]]]
        for batches in invalid:
            with self.subTest(batches=batches):
                with self.assertRaisesRegex(RuntimeError, "exactly once"):
                    validate_batches(batches)

    def test_promoting_a_batch_preserves_unselected_api_files(self):
        source = Path(self.temp.name) / "stage"
        for locale in ["fr", "ru"]:
            (source / locale).mkdir(parents=True)
            (source / locale / "all.json").write_text('{"new":true}')
        before_english = (self.api / "en/all.json").read_bytes()
        promote_locales(source, self.api, ["fr", "ru"])
        self.assertEqual((self.api / "fr/all.json").read_text(), '{"new":true}')
        self.assertEqual((self.api / "ru/all.json").read_text(), '{"new":true}')
        self.assertEqual((self.api / "en/all.json").read_bytes(), before_english)
        self.assertFalse((source / "fr").exists())

    def test_an_incomplete_batch_cannot_overwrite_its_first_existing_locale(self):
        source = Path(self.temp.name) / "stage"
        (source / "fr").mkdir(parents=True)
        (source / "fr/all.json").write_text('{"new":true}')
        before = (self.api / "fr/all.json").read_bytes()
        with self.assertRaisesRegex(RuntimeError, "Missing or unsafe"):
            promote_locales(source, self.api, ["fr", "ru"])
        self.assertEqual((self.api / "fr/all.json").read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
