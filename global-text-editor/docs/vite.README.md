# Vite vs CRA
__Vite__ is a tool that addresses the major setbacks of the CRA.
Some of the key built-in features in Vite:

## 1. Fast Hot Module Replacement (HMR)
If you update the code in a module, Vite only reloads that modified module, not all the modules. CRA, on the other had, relies on __Webpack__ bundler that packages files together. All modules need to be compiled and bundled using the bundler before changes are seen in the browser.

> A __Bundler__ is a tool that takes your project files (JS modules, CSS, and images, etc) and produces a small set of output files (bundles) that browsers or apps can load efficiently

## 2. Use of native ES Modules:dsadsadsasda
Vite uses native ES modules, serving the modules directly to the browser without any initial bundling. Browsers can load modules independently as changes are made, thus speeding up development process. __CRA__ does support native ES modules, but it relies on __Webpack__ to bundle and serve these modules during development, instead of serving them directly in their native form as Vite does.

## 3. RollUp as it's Bundler
RollUp is a bundler known for its exceptional function in producing a smaller and highly optimized bundler. RollUp also has tree-shaking features—a technique used in module bundlers to remove unused code, reducing the final bundle size. CRA uses the Webpack as its bundler, which also supports tree-shaking but can create larger bundles and may not be as efficient as RollUp.

## 4. Support multiple frameworks
CRA is React-specific, but Vite supports multiple frameworks.

## 5. Built-In EsBuild tool
EsBuild is an ultra-fast JavaScript bundler that hastens the building process in modern web development.
Vite uses the EsBuild tool for its development server and HMR and relies on RollUp for its production build.
 CRA, by contrast, does not. Instead, it relies entirely on Webpack for bundling and development process.

## 6. Supports JavaScript and Typescript:
Vite has built-in support for modern JavaScript (JS), Typescript (TS), and additional features like CSS, JSX, and more plugins without requiring additional configuration.
CRA may require additional configuration to completely support some features.
 

## 7. PlugIn API: 
One of the features that makes vite exceptional is the plugin API. Developers can customize Vite's functionality using the plugin API. 
Additionally, the plugin API is compatible with the RollUp PlugIn. 
There isn't a plugin API included with Create-React-App (CRA). The CRA offers a zero-configuration setup; although it permits some customization using environment variables, plugins are not supported natively.

