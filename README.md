npm create vite@latest my-word-addin -- --template react
npm install office-addin-debugging office-addin-manifest --save-dev
npm install @types/office-js --save-dev
npm install tailwindcss @tailwindcss/vite
--npm install react-dropzone
--npm install lucide-react

npx office-addin-manifest modify manifest.xml -g (Run npx office-addin-manifest modify manifest.xml -g to give your add-in its own unique GUID.)
npx office-addin-manifest validate manifest.xml (Use npx office-addin-manifest validate manifest.xml to check for schema errors before sideloading.)

npx office-addin-dev-certs install
  Generates Local Certificates: It creates a unique Developer CA certificate and a localhost SSL certificate (including a private key) on   your machine.
  Installs the CA Certificate: It adds the generated "Developer CA for Microsoft Office Add-ins" to your operating system's Trusted Root   Certification Authorities.
  Enables System-Wide Trust: By installing the CA certificate, browsers (Edge, Chrome) and the Word desktop host (WebView2) will trust your   https://localhost development server without displaying "unsafe" or "unsupported protocol" warnings.
  Sets 30-Day Validity: The certificates are valid for 30 days by default, after which they must be re-installed. 

npm run build
npm run dev

debug/dev only works for "word in browser"
well, it now seems to work for desktop word as well:
npx office-addin-debugging start manifest.xml word
npx office-addin-debugging stop manifest.xml


See https://learn.microsoft.com/en-us/office/dev/add-ins/develop/xml-manifest-overview?tabs=tabid-1


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
