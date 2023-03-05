# Introduction

An unofficial JSON API for Counter-Strike: Global Offensive.

All data are retrieved from [items_game.txt](https://github.com/SteamDatabase/GameTracking-CSGO/blob/master/csgo/scripts/items/items_game.txt) and [csgo_english.txt](https://github.com/SteamDatabase/GameTracking-CSGO/blob/master/csgo/resource/csgo_english.txt). These files use Valve's KeyValue text file format and have to be parsed with [vdf-parser](https://github.com/p0358/vdf-parser).

## Usage

By default the data is in english, if you want to get the data in another language, you can add the language to the BASE URL.

```http
GET https://bymykel.github.io/CSGO-API/api/{language}
```

### Language

Can be one of the following: `bg` `cs` `da` `de` `el` `en` `es` `es-MX` `fi` `fr` `hu` `it` `ja` `ko` `nl` `no` `pl` `pt-BR` `pt-PT` `ro` `ru` `sk` `sv` `th` `tr` `uk` `zh-CN` `zh-TW`

### All items

```http
GET https://bymykel.github.io/CSGO-API/api/en/all.json
```

Object with all items accessible by their id.

### List skins

```http
GET https://bymykel.github.io/CSGO-API/api/en/skins.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">weapon</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">pattern</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">min_float</td>
    <td width="400">number</td>
  </tr>
  <tr>
    <td width="400">max_float</td>
    <td width="400">number</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">stattrak</td>
    <td width="400">boolean</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List stickers

```http
GET https://bymykel.github.io/CSGO-API/api/en/stickers.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>

### List collections

```http
GET https://bymykel.github.io/CSGO-API/api/en/collections.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List crates

This list includes cases, capsules, graffiti boxes, music kit boxes and souvenir packages.

```http
GET https://bymykel.github.io/CSGO-API/api/en/crates.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">type</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">first_sale_date</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List keys

```http
GET https://bymykel.github.io/CSGO-API/api/en/keys.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List collectibles

```http
GET https://bymykel.github.io/CSGO-API/api/en/collectibles.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">type</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List agents

```http
GET https://bymykel.github.io/CSGO-API/api/en/agents.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List patches

```http
GET https://bymykel.github.io/CSGO-API/api/en/patches.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List graffiti

```http
GET https://bymykel.github.io/CSGO-API/api/en/graffiti.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>

### List music kits

```http
GET https://bymykel.github.io/CSGO-API/api/en/music_kits.json
```

<table align="center">
  <tr>
    <td colspan="2" color="yellow">array[object]</td>
  </tr>
  <tr>
    <td width="400">id</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">name</td>
    <td width="400">string</td>
  </tr>
  <tr>
    <td width="400">description</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">rarity</td>
    <td width="400">string or null</td>
  </tr>
  <tr>
    <td width="400">exclusive</td>
    <td width="400">boolean</td>
  </tr>
  <tr>
    <td width="400">image</td>
    <td width="400">string</td>
  </tr>
</table>
