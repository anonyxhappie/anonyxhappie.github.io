# Codebase Overview & Implementation Guide

This document explains the entire implementation of the interactive newspaper portfolio (`index.html`). It is intended to help other LLMs or developers understand the architecture, physics simulation, rendering pipeline, and known issues.

## 1. Architecture Overview

The application is a single-file Vanilla JavaScript project. It uses no external frameworks (except Tailwind CSS via CDN for rapid styling, though mostly custom CSS is used). The core concept is rendering an interactive 3D cloth simulation entirely within a 2D HTML5 `<canvas>` using custom physics and texture mapping.

*   **File:** `index.html`
*   **Core Technologies:** HTML5 Canvas API (2D context), custom Verlet integration physics, custom affine texture mapping.

## 2. Configuration and State Management

### Configuration (`CONFIG`)
Defines the constants for the physics simulation.
*   **Grid Size:** `BASE_GRID_X`, `BASE_GRID_Y` define the number of vertices in the cloth mesh.
*   **Physics Tuning:** `paperStiffness`, `bendStiffness`, `compressionStiff` determine how rigid the cloth is.
*   **Forces:** `gravity`, `wind`, `homePull` (the tendency of vertices to return to their original flat state).
*   **Visuals:** `shadingIntensity`, `shadowAlpha`.

### State (`state`)
Maintains the runtime state of the application.
*   **Dimensions:** Window dimensions (`w`, `h`) and logical paper dimensions (`sheetW`, `sheetH`).
*   **Physics Data:** Arrays for `points` (vertices) and `constraints` (springs between vertices).
*   **Interaction:** `pointer` object tracking mouse/touch drag state.
*   **Offscreen Canvases:** `contentCanvas` (renders the crisp text layout) and `backCanvas` (renders the desaturated/blurred backface of the paper).

## 3. The Physics Engine

The cloth simulation is driven by **Verlet Integration**. It calculates the future position of a point based on its current position and previous position, eliminating the need to explicitly store velocity.

### Setup (`rebuildMesh`)
*   Creates a grid of points spanning `sheetW` by `sheetH`.
*   Connects points using constraints:
    *   **Structural constraints:** Vertical and horizontal connections between adjacent points.
    *   **Shear/Bend constraints:** Diagonal connections to provide rigidity.

### The Physics Loop (`updatePhysics`)
Executed every frame (typically 60fps) before rendering:
1.  **Apply Forces:** Gravity, wind, and `homePull` are applied to each point. If the user is dragging (`pointer.down`), a drag force pulls points toward the cursor.
2.  **Verlet Integration:** Updates point coordinates.
3.  **Constraint Solving:** Iterates multiple times (`CONFIG.iterations`). It checks the distance between connected points and pushes/pulls them to maintain their original resting distance. Multiple iterations are required because satisfying one constraint often violates a neighboring one.

## 4. The Rendering Pipeline

The rendering is split into two distinct phases to optimize performance:

### Phase 1: Offscreen Content Rendering (`renderContentTexture`)
Instead of drawing text dynamically onto the moving 3D mesh (which is computationally impossible with standard canvas text APIs), the entire newspaper layout is drawn *once* (or only on resize) onto an offscreen canvas (`state.contentCanvas`). 
*   **Typography:** Uses predefined fonts (Playfair Display, Source Serif 4).
*   **Layout:** Calculates wrapping text, dynamic font sizes relative to `sheetW`, and renders the masthead, experiences, skills, and contact info.
*   **Backface:** A blurred, desaturated copy of the content canvas is drawn to `state.backCanvas` to simulate light bleeding through thin newspaper.

### Phase 2: 3D Mesh Rendering (`drawMesh`)
This is the core visual trick. The 2D canvas does not support 3D texturing, so it is emulated.
*   The grid is divided into quads. Each quad is split into two triangles.
*   **Affine Texture Mapping:** A custom `drawTriangle` function takes the 2D coordinates of the offscreen texture and maps them to the deformed 3D coordinates of the mesh triangle using a transformation matrix (`ctx.transform`).
*   **Backface Culling & Shading:** 
    *   The cross product of the triangle's edges determines its normal vector (facing towards or away from the camera).
    *   If facing away, the `backCanvas` texture is used, tinted darker.
    *   The angle of the normal is used to apply a dynamic black overlay with varying alpha, creating realistic 3D shading and folds.

## 5. Interaction & Sizing

*   **Resize Handling:** Captures `window.devicePixelRatio` and `getBoundingClientRect()` to ensure the internal canvas buffer matches physical pixels (essential for high-DPI/Retina screens). It adjusts `sheetW` and `sheetH` to fit the viewport.
*   **Mouse/Touch:** Listens for `pointerdown`, `pointermove`, and `pointerup`. It finds the nearest vertex to the cursor and applies a continuous spring force dragging it towards the cursor.

---

## ⚠️ Known Issues: Mobile UI & Layout

**Status: Needs Immediate Fix**

Despite recent optimizations to sizing logic and DPR scaling, the mobile user interface and layout are fundamentally broken on narrow viewports (e.g., iPhone dimensions like 390x844).

### The Core Problem
The physics engine and mesh coordinate system heavily conflict with narrow aspect ratios. Specifically:
1.  **Aspect Ratio Mismatch:** The newspaper layout requires a certain width to render text legibly. On mobile, squeezing the `sheetW` forces text to wrap aggressively, breaking the newspaper aesthetic.
2.  **Physics Instability:** Because the layout relies on a 2D canvas drawing a simulated 3D cloth, the physics constraints struggle on mobile. The gravity and edge forces cause the paper to aggressively curl, fold over itself, or show the gray backface continuously. 
3.  **"Band-Aid" Fixes:** Attempts to fix this by increasing `homePull` to `1.0` (disabling physics) or altering `sheetH` have proven insufficient, as they either break the interactive nature of the site or fail to resolve the fundamental canvas scaling issues on physical devices versus emulators.

**Next Steps for AI/Developers:**
A complete refactor of the mobile strategy is required. Instead of forcing the 3D cloth physics to work on a 390px wide screen, the mobile view should likely:
*   Disable the canvas WebGL/cloth simulation entirely.
*   Fallback to a standard DOM-based CSS layout (HTML text and divs) that mimics the newspaper style but scrolls naturally.
*   Or, completely recalculate the internal grid projection specifically tailored for portrait mobile screens, ensuring forces never cause self-intersection or aggressive curling.
