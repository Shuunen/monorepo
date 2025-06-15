# Configs Sync

This app let me sync my configs from my local machine to this git repository.

It is useful to keep my configs in sync across multiple machines, and also to have a backup of them.

## Sync

```bash
bun apps/config-sync
bun apps/config-sync --setup # tell sync to create files if they does not exists
bun apps/config-sync --dry   # show what sync want to do without modifying anything on the fs
```
