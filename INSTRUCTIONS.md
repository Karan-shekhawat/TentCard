# Project Instructions and Documentation

## 1. Summary of Changes
We have successfully identified and fixed the following issues in the project:

-   **Fixed Linting Error in `App.tsx`**:
    -   **Error**: `useEffect` was imported but never used.
    -   **Fix**: Removed the unused `useEffect` import to clean up the code and satisfy linting rules.

-   **Fixed Broken Resource Link in `index.html`**:
    -   **Error**: The file referenced `index.css`, but this file did not exist in the project directory.
    -   **Fix**: Removed the `<link rel="stylesheet" href="/index.css">` tag. The project uses Tailwind CSS via CDN and inline styles, so this external file was unnecessary.

## 2. Project File Structure
The project is a **Vite + React + TypeScript** application. Here is an overview of the key files:

-   **`index.html`**: The entry point HTML file. It includes the Tailwind CSS CDN script and mounts the React root.
-   **`src/` (Root)**:
    -   **`index.tsx`**: The JavaScript entry point that renders the React app into the DOM.
    -   **`App.tsx`**: The main application component containing the layout and state management.
    -   **`types.ts`**: TypeScript definitions for application data structures (e.g., `AppConfig`, `NameEntry`).
    -   **`constants.ts`**: Configuration constants like font options, color palettes, and default data.
    -   **`vite.config.ts`**: Configuration file for the Vite build tool.
    -   **`package.json`**: Lists project dependencies and scripts.
    -   **`tsconfig.json`**: TypeScript compiler configuration.

-   **`components/`**:
    -   **`Sidebar.tsx`**: The left-hand control panel for editing names and settings.
    -   **`PrintPreview.tsx`**: Displays the live preview of the name plates on the simulated paper.
    -   **`NamePlate.tsx`**: The individual component that renders a single name plate.
    -   **`PrintModal.tsx`**: A modal dialog shown before printing.

## 3. Errors Encountered and Fixed
| File | Issue | Resolution |
| :--- | :--- | :--- |
| `App.tsx` | Unused `useEffect` import | Removed the import. |
| `index.html` | Broken link to missing `index.css` | Removed the `<link>` tag. |

## 4. How to Run the App

### Prerequisites
-   **Node.js** installed on your machine.

### Steps
1.  **Install Dependencies**:
    Open a terminal in the project folder and run:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    To run the app locally with hot-reloading:
    ```bash
    npm run dev
    ```
    Then open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.

3.  **Build for Production**:
    To create an optimized build for deployment:
    ```bash
    npm run build
    ```
    The output will be in the `dist/` folder.

4.  **Preview Production Build**:
    To locally preview the production build:
    ```bash
    npm run preview
    ```
