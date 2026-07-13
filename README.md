# PL-JM — Job Maintenance

Platinum epic: Job Maintenance prototype.

## Setup

Clone with submodules to get design tokens:

```bash
git clone --recurse-submodules <repo-url>
```

If already cloned: `git submodule update --init`

## Pulling updated design tokens

When `platinum-shared` has been updated:

```bash
git submodule update --remote shared
git add shared
git commit -m "Update shared design tokens"
```

See [platinum-shared](https://github.com/hpembridge/platinum-shared) for full maintenance docs.

## Architecture — how the job detail page is assembled

`job-detail-page.html` is a thin **shell**. Each section of the page lives in its
own standalone `.html` file (its own HTML + CSS, openable on its own for review):

| Section | File |
| --- | --- |
| Top bar | `components/topbar/topbar.html` |
| Job header | `components/job-header/job-header.html` |
| Production tab | `components/production-tab/production-tab.html` |
| Shipping tab | `components/shipping-tab/shipping-tab.html` |
| Modals | `modals/<name>/<name>.html`, plus `components/shipping-tab/ship-*.html` |

In the shell, each section is a placeholder:

```html
<div data-include="components/topbar/topbar.html"></div>
```

`loader.js` fetches each file on load, injects the markup inside its `<body>`
where the placeholder sits, then runs the component scripts. The assembled page
is identical to one hand-written file — just built from parts, so HTML/CSS can be
edited one block at a time. The JS all runs from the existing per-component files
(devs don't touch it).

**Run over a local server** (fetch doesn't work from `file://`):

```bash
python3 -m http.server
# then open http://localhost:8000/job-detail-page.html
```
