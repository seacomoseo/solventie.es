# solventie.es

[![solventie.es](/uploads/logo.svg)](https://solventie.es/)


## STEPS


### CMS

- [`Gitlab ⏩ Edit profile ⏩ Access Token`](https://gitlab.com/-/profile/personal_access_tokens)
  - `Token name`: `netlify-identity`
  - `Expiration date`: remove
  - `Select scopes`: check `api`, `read_api`, `read_repository` and `write_repository`
  - `Create personal access token` ⏩ copy `our new personal access token`
- If Identity Access
  - [`Netlify ⏩ Site ⏩ Settings ⏩ Identity`](https://app.netlify.com/sites/solventie/settings/identity) ⏩ `Enable Identity`
    - [`Git Gateway`](https://app.netlify.com/sites/solventie/settings/identity#git-gateway) ⏩ `Edit settings` ⏩ Paste the gitlab code copied in `GitLab personal access token ⏩ Save`
    - [Registration preferences](https://app.netlify.com/sites/solventie/settings/identity#registration-preferences) ⏩ Edit settings ⏩ Invite only ⏩ Save
    - [`External providers`](https://app.netlify.com/sites/solventie/settings/identity#external-providers) ⏩ Add provider ⏩ Gitlab ⏩ Use default configuration ⏩ Enable GitLab
  - [`Netlify ⏩ Site ⏩ Identity`](https://app.netlify.com/sites/solventie/identity) ⏩ Invite users ⏩ email `solventie@seacomoseo.com` (and other if you want) ⏩ Check email from `no-reply@netlify.com` ⏩ Accept the invite ⏩ Add `/admin/` in the URL between `/` and `#` ⏩ Add password `Fotovoltaic4...`


### Local

- Design
  - GENERAL
    - `config.yml`
    - `data/*.{yml,md}`
  - FONTS
    - Fonts that not be in Google Fonts:
      - .otf/.ttf files in `assets/fonts` + rename
      - You need the `sansoul_tools` project in `../_tools` folder
      - Run `do fonts` comand
      - `Family` + `Style` + `Weight` must match in `config.yml ⏩ params.fonts` + `_fonts.scss` (and disable `params.fonts.google` if appropriate)
  - CONTENT
    - `content/*`
      - SCRAP
        - Copy [this Spreadsheet Layout](https://docs.google.com/spreadsheets/d/1bXK2OW_SYJK3u3SUO8KRoXUXr9kj42yehXw2O0UapEY/)
        - First scrap with Screaming Frog and paste `url` and `title`
        - Second scrap with `IMPORTXML` formula in `content-start` tab
        - If need HTML content
          - Three scrap with `Web Scraper` chrome extension and paste in `content-scrap` tab
          - Copy `content-start` tab into `content-next` and get `body_code` (by `content-scrap`) with `VLOOKUP` formula
          - Copy `body_code` column to `body`, [convert to Markdown](https://codebeautify.org/html-to-markdown) and clean it
        - Copy `content-next` to `content-export` without `url` and `body_code`
        - Export to CSV ⏩ [convert to YM](https://onlineyamltools.com/convert-csv-to-yaml) ⏩ paste in `./Downloads/DIR/pages.yml` and clean it + write `___` to split files
        - Execute `../_tools/yml-split.command`
        - Paste Markdown files in `blog`
  - NETLIFY CMS
    - `data/cms-custom-row.yml`
  - CSS
    - `assets/css/*`
    - `assets/css/` ⏩ `_variables-custom.scss` + `_custom.scss`
    - `data/config.yml ⏩ custom_code.css.code`
  - IMG
    - `uploads/*`
  - REDIRECTS
    - `assets/redirects.md`
  - ROBOTS
    - `assets/robots.md`
  - If Multilanguaje and Multihosting, add `cp ./public/[es|en]/404.html ./public/` in `netlify.toml ⏩ build.command`
  - Try in Safari and Firefox
  - Check in [W3 Validator](https://validator.w3.org/)
  - Check in [PageSpeed Insights](https://pagespeed.web.dev/)


### After client validate web


#### Domain

- If Netlify
  - [`Domain Management / settings`](https://app.netlify.com/sites/solventie/settings/domain)
  - `Add custom domain`
  - `Check DNS configuration` Copy
  - Add `DNS Records` copied from Netlify to Domain gestor:
    - From: `solventie.es`
      DNS Record: `ALIAS`, `ANAME` or `flattened CNAME`
      To: `apex-loadbalancer.netlify.com`
    - From: `solventie.es`
      DNS Record: `A`
      To: `75.2.60.5`
    - From: `www`
      DNS Record: `CNAME`
      To: `solventie.netlify.app.`
    - Maybe you need to eliminate the previous records with similar names
  - `Verify DNS configuration`
  - If it does not work after a while, try `Set as main domain` in the `www` version and also in te `nowww` version
- If Cloudflare Pages
  - [Custom domains](https://dash.cloudflare.com/?to=/:account/pages/view/solventie/domains)
  - `Set up a custom domains`
  - `solventie.es`
  - `Continue`
  - `Activate domain` (if `Begin DNS transfer` end)
  - Repeat with `www.solventie.es`
  - ...........................................................


#### [Google Search Console](https://search.google.com/search-console)

- Add property
- Verify versions ⏩ `data/config.yml`
  - `ga4`
  - `g_site_verify`
  - `g_file_verify`
  - DNS:
    From: `@`
    DNS Record: `TXT`
    To: `google-site-verification=[g_site_verify]`
- Link with Analytics
- Add sitemap.xml


#### [Disqus](https://disqus.com/)

- `data/config.yml ⏩ disqus`


#### Collaborators

- [Google Search Console](https://search.google.com/search-console) ⏩ `Site ⏩ Settings ⏩ Users and permissions ⏩ Add user` Add emails of collaborators with `Full` permission


##### Delivery

Send to all collaborators next:

```
*ENTREGA WEB solventie.es:* https://seacomoseo.com/entrega/
```
