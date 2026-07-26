# Permission justification

`manifest.json` requests **zero** permissions and **zero** host permissions — there is no
`"permissions"` or `"host_permissions"` key in it at all. This is the fastest possible path
through Chrome Web Store's permission review, since there is nothing to justify.

Some submission flows show a justification field regardless of what the manifest declares. If one
appears, paste:

> This extension requests no browser permissions, no host permissions, and makes no network
> requests of any kind. It is a self-contained popup UI; all data is generated locally at build
> time and held in memory while the popup is open.

## Single purpose description

If the dashboard asks for one:

> Demonstrates the complete user interface and interaction design of a multi-chain self-custody
> crypto wallet, using only local sample data.

## Data usage / "Privacy practices" tab

The current dashboard has a separate certification step asking what user data the extension
collects, in addition to the plain permissions list. Answer **none** across the board — this
matches `store/privacy-policy.md` and the "This build" panel already shown to users on
Settings → About inside the extension itself.
