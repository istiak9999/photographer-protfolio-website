# Elias Vance Photography

A responsive, single-page photography portfolio built with plain HTML, CSS, and JavaScript. The project is designed as a starting point for presenting a photographer's work, background, journal, and contact details in one polished page.

The page uses a sample photographer identity and sample portfolio copy. Replace those details and make sure you have permission to use every image before adapting it for your own work.

![Preview of the Elias Vance Photography portfolio](preview.png)

## Features

- Responsive layout with a mobile navigation menu
- Photography gallery with Landscape, Portrait, and Urban filters
- Full-size image lightbox with captions, previous/next controls, and keyboard navigation
- Journal cards that open full articles in a reader modal
- About, biography, and contact sections
- Contact form markup with required fields
- Scroll progress indicator, animated counters, and reveal-on-scroll effects
- Keyboard support and focus handling for navigation and dialogs
- Reduced-motion support and lazy-loaded portfolio images
- Light and dark color palettes based on the visitor's system preference

## Built with

- HTML5 for the page structure and content
- CSS3 for layout, styling, responsive behavior, and animation
- Vanilla JavaScript for page interactions
- Google Fonts for Space Grotesk and Syne, with system font fallbacks

There is no build step, framework, package manager, or JavaScript dependency required.

## Contact

For inquiries, collaborations, or bookings:

- Email: istiakahmedkhan.official@gmail.com

## Run locally

You can open `index.html` directly in a modern browser. For a more representative local setup, serve the project folder over HTTP:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser. If Python is not installed, use another simple local static-file server, such as the Live Server extension in Visual Studio Code.

## Project structure

```text
.
├── index.html          # Page content, gallery items, journal cards, and modal markup
├── styles.css          # Theme, layout, responsive rules, and visual effects
├── script.js           # Menu, gallery, modals, counters, and scroll interactions
└── assets/
    └── images/         # Hero, gallery, about, and journal images
```

Keep the folder structure intact unless you also update the corresponding image paths in `index.html` and `script.js`.

## Customize the portfolio

### 1. Update the identity and page content

Edit `index.html` to change the photographer's name, page title, description, biography, locations, contact details, section copy, and footer. The navigation links point to sections by their IDs (`work`, `about`, `journal`, and `contact`); keep those IDs in sync if you rename or reorganize sections.

The introductory copy, statistics, and dates are example content. Update them to reflect accurate information for the portfolio you build.

### 2. Replace the images

Put your image files in `assets/images/`, then update the relevant `src` and `data-full` attributes in `index.html`. The `data-full` value is the image opened by the gallery lightbox; it should point to the full-size image for the same work card.

Gallery images also have descriptive `alt` text. Write useful alternatives for images that convey information, and use an empty `alt` value for purely decorative images. The hero image is preloaded, while most other images are lazy-loaded.

### 3. Add or edit gallery items

Each gallery item is a `.work-card` in `index.html`. To add an item:

1. Duplicate a `<figure class="work-card">` block.
2. Set its `data-category` to one of the existing filter values: `landscape`, `portrait`, or `urban`.
3. Update the image paths, alt text, title, category label, location, and accessible link label.
4. Ensure the link's `data-full` points to the full-size image.

The filter buttons use the same category values in their `data-filter` attributes. The lightbox reads its title, category, location, and image path from each card, so keep that card content complete. Its image counter is generated from the currently visible gallery items and does not need manual editing.

### 4. Edit journal articles

Journal card titles, summaries, dates, and image previews are in `index.html`. The full article text is stored in the `articles` object in `script.js`.

Each card's `data-article` value must match a key in that object. When adding an article, create a matching object entry with a title, metadata, image path, alt text, and body. The body is HTML rendered inside the reader modal; use trusted, locally authored content.

### 5. Configure the contact form

The contact form in `index.html` currently submits to the placeholder URL `https://formspree.io/f/your-form-id`. Replace it with a valid endpoint from the form service you choose, or connect the form to your own backend. Until configured, successful delivery of inquiries is not set up.

You can also update the `mailto:` links and the visible email address. The browser validates the required fields, but a live form service or backend is needed to receive submissions.

### 6. Adjust the design

Use `styles.css` to change colors, type, spacing, image presentation, and breakpoints. The file begins with CSS custom properties in `:root` for the main theme values. A dark palette is applied through `prefers-color-scheme: dark`; responsive layouts are defined with media queries.

The project loads Google Fonts from an external service. An internet connection is needed to load those fonts; system fallbacks are included for offline use.

## How the interactions work

`script.js` initializes the interactive features after the page markup is loaded:

- The mobile menu updates its expanded state and closes on navigation, Escape, or a wider viewport.
- Gallery filters hide cards that do not match the selected category.
- The lightbox opens the selected card's full image, supports previous/next navigation, and closes with Escape or its close controls.
- Journal cards open an article reader populated from the article data in the script.
- Intersection observers trigger reveal effects and animate statistics when they enter view.
- The scroll progress bar and subtle hero pointer effect respond to scrolling and pointer movement.

The project respects the operating system's reduced-motion preference for motion-sensitive visitors.

## Accessibility notes

The page includes semantic sections and navigation landmarks, a skip link, labels for form fields, descriptive image text, ARIA state on interactive controls, keyboard-operable dialogs, and focus restoration when dialogs close. When changing the markup, preserve these labels and relationships and verify the experience using both keyboard navigation and a screen reader.

## Browser support and troubleshooting

Use a current browser with JavaScript enabled. If images are missing, check that each path and filename—including letter case—matches the files in `assets/images/`. If the gallery or journal modal does not open, check the browser console for JavaScript errors and confirm that the relevant card data attributes match their script entries.

## License and image rights

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full text.

The source code and project files are covered by the MIT license. Third-party images, fonts, and other assets may carry their own licensing terms, so please verify permissions before reusing them in your own work.
