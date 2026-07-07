# Ippon UI Website

Exposes every published version of the [Ippon UI](https://github.com/ippontech/ui) Pattern Library (`@ippon-ui/styles`) on GitHub Pages under `styles/<version>/`, with `styles/latest/` pointing to the highest stable version.

## Getting started

```shell
mise trust
mise install
mise setup
```

Build the site locally into `public/`:

```shell
mise build
```

Serve it locally on [http://localhost:4290](http://localhost:4290):

```shell
mise dev
```

The sync is incremental: already-mirrored versions are kept, versions removed from the registry are deleted, and only missing versions are downloaded.

See [AGENTS.md](AGENTS.md) for the architecture and the full command list.
