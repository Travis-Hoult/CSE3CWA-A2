# CSE3CWA / CSE5006 – Assignment 1  

## Project Overview  
This project is a **front-end web application** built with **Next.js (React + TypeScript)**.  
It demonstrates the use of:  
- React components  
- State management (`useState`, `useEffect`)  
- Dynamic rendering  
- Local storage for persistence  
- Modularised component design  

The assignment implements a **tabs builder interface** that allows the user to create, edit, and manage content in a structured way.  

---

## Tech Stack  
- **Next.js 14** (React framework)  
- **TypeScript**  
- **Bootstrap** (for styling and layout)  
- **LocalStorage** (to persist state between refreshes)  

---

## How to Run the Project  

1. Navigate to the project folder:  
   ```bash
   cd cse3cwa-a1
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Start the development server:  
   ```bash
   npm run dev
   ```

4. Open in your browser:  
   ```
   http://localhost:3000
   ```

---

## Features and Assignment Requirements  

The following table shows how the assignment requirements have been met in this project:  

| Requirement | Implementation |
|-------------|----------------|
| **User Interface** (Nav Bar, Header, Footer, About Page) | Implemented: `Menu.tsx` (Hamburger Navigation Bar), `Header.tsx`, `Footer.tsx`, and an `About` page with project details. |
| **Themes** (Dark/Light mode) | Implemented using a `ThemeToggle.tsx` component. Users can switch between Dark Mode and Light Mode. |
| **Hamburger/Kebab Menu with CSS Transform** | Implemented as `Menu.tsx` (Hamburger Menu). Includes CSS transitions and transforms for open/close animation. |
| **Tabs Page (Operations)** | `TabsBuilder.tsx` allows: up to 15 tabs, tab headings to be renamed, content to be updated, and tabs persisted in `localStorage`. |
| **Output Button** | An `OutputButton.tsx` generates inline-only HTML + CSS output that can be pasted into a standalone HTML file. Matches the examples demonstrated in lectures. |
| **GitHub** | Several commits made across development. Feature branches created (e.g., `hamburger-menu`). `node_modules` excluded via `.gitignore`. `README.md` updated and includes AI Acknowledgement. |

---

## AI Acknowledgement  

Artificial Intelligence (AI) tools were used throughout the development of this assignment **as a learning assistant**.  
The use of AI was limited to support the **understanding and application of coding concepts** and to provide guidance where I was stuck.  

Specifically, AI was used for:  
- **Code Correction and Editing** – reviewing and suggesting improvements for syntax, structure, and React/Next.js best practices.  
- **Assignment Planning and Scheduling** – breaking down tasks and deliverables into manageable steps.  
- **Formatting and Commenting Consistency and Clarity** – making the codebase and documentation easier to read.  
- **Concept Development** – discussing possible approaches to features (e.g. tabs builder, state handling, output handling).  
- **Tracking of Deliverables** – ensuring progress was aligned with assignment requirements and deadlines.  

AI was **not used to generate the entire solution**. All final design decisions, code implementation, testing, and submission are my own work. AI supported my **learning process**, similar to a tutor or peer mentor, by providing suggestions and clarifications.  

---

## License  
This project is for **educational purposes only** as part of CSE3CWA / CSE5006 coursework.  
