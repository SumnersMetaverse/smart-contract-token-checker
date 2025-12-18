# Meta-Earth Repository Assets

This directory contains the meta-earth asset catalog used for contract verification in the Token Inspector extension.

## Structure

The `catalog.json` file contains verified contract information across multiple blockchain networks.

### Catalog Schema

```json
{
  "version": "1.0.0",
  "lastUpdated": "ISO 8601 timestamp",
  "description": "Catalog description",
  "networks": {
    "network_name": {
      "chainId": number,
      "name": "Human-readable name",
      "rpc": "RPC endpoint"
    }
  },
  "assets": [
    {
      "name": "Token Name",
      "symbol": "SYMBOL",
      "address": "0x...",
      "network": "network_name",
      "decimals": 18,
      "verified": true/false,
      "addedAt": "ISO 8601 timestamp",
      "tags": ["tag1", "tag2"],
      "description": "Asset description"
    }
  ],
  "categories": {
    "tag": "Description"
  }
}
```

## Usage

The Token Inspector extension automatically fetches this catalog from the meta-earth repository to verify contracts during token inspection.

### Verification Levels

- **Verified**: Listed in catalog with `verified: true`
- **Listed**: Listed in catalog with `verified: false`
- **Unverified**: Not found in catalog

## Adding New Assets

To add a new asset to the catalog:

1. Fork the meta-earth repository
2. Edit `assets/catalog.json`
3. Add your asset entry with all required fields
4. Submit a pull request with verification details

### Required Fields

- `name`: Token name
- `symbol`: Token symbol
- `address`: Contract address (lowercase)
- `network`: Network identifier (ethereum, polygon, bsc)
- `decimals`: Number of decimals
- `verified`: Verification status
- `addedAt`: ISO 8601 timestamp

### Optional Fields

- `tags`: Array of category tags
- `description`: Asset description
- `website`: Official website URL
- `social`: Social media links

## Integration with Mempool.space

The verification system also checks mempool.space for Bitcoin-related assets. For EVM chains, the primary verification source is this meta-earth catalog.

## Security

Only add assets that have been thoroughly verified. False verification can lead to security issues for users.

## API Access

The catalog is publicly accessible via GitHub raw content:

```
https://raw.githubusercontent.com/SumnersMetaverse/meta-earth/main/assets/catalog.json
```

## Updates

The catalog is updated regularly. The `lastUpdated` field indicates the last modification timestamp.
