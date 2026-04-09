# Beamer presentation

Edit `presentation.tex`, then build locally or rely on CI.

## Local build

Requires a TeX distribution with Beamer (e.g. TeX Live).

```bash
make
```

Produces `presentation.pdf` (ignored by git).

## Published site (GitHub Pages)

On every push to `main`, GitHub Actions builds the PDF and deploys a small static page that embeds it.

1. Repo **Settings → Pages**
2. **Build and deployment → Source**: **GitHub Actions**
3. After the next successful workflow run, open **Settings → Pages** (or the job summary) for the site URL, usually:

   `https://<user>.github.io/<repo>/`

Pull requests still run the PDF build (artifact only); they do not deploy Pages.

## Workflow (CI)

- **Build** — compiles the PDF and uploads a **presentation** artifact (runs on PRs and `main`).
- **Publish + deploy** — on `main` only, packages `web/index.html` + the PDF for GitHub Pages and deploys.
