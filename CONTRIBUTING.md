# Contributing to Cotton Candy Bot 🍬

First off, thanks for taking the time to contribute! 🎉

Cotton Candy Bot is an open-source project, and we love to receive contributions from our community — you! There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests, or writing code which can be incorporated into the project.

## 🛠️ Development Process

1.  **Fork the repository** and clone it locally.
2.  **Install dependencies** (`npm install` in root, `npm install` in `server/`).
3.  **Create a branch** for your edits.
4.  **Make your changes**.
5.  **Test your changes**.
6.  **Submit a Pull Request**.

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by opening a new issue; it's that easy!

**Great Bug Reports** tend to have:

-   A quick summary and/or background.
-   Steps to reproduce.
    -   Be specific!
    -   Give sample code if you can.
-   What you expected would happen.
-   What actually happened.
-   Notes (possibly including why you think this might be happening, or stuff you tried that didn't work).

## 💡 Feature Requests

We love new ideas! If you have an idea for a feature, please check existing issues to see if it's already being discussed. If not, feel free to open a new issue.

## 💻 Pull Requests

*   **Document any change in behavior**. Make sure the `README.md` and any other relevant documentation are kept up-to-date.
*   **Consider our release cycle**. We try to follow SemVer v2.0.0. Randomly breaking public APIs is not an option.
*   **One pull request per feature**. If you want to do more than one thing, send multiple pull requests.
*   **Send coherent history**. Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please squash them before submitting.

## 🎨 Code Style

*   We use **TypeScript** for type safety. Please ensure all new code is strongly typed.
*   We follow standard **Prettier** formatting.
*   Use descriptive variable and function names.

## �️ Generating Visual Assets

We use a Python script to programmatically generate the visual assets (headers, feature cards) used in the `README.md`. This ensures consistent branding and easy updates.

### Prerequisites
*   Python 3.x
*   Pillow (`pip install Pillow`)

### Usage
Run the generation script from the root directory:
```bash
python scripts/generate_assets.py
```

This will:
1.  Generate high-quality PNGs in `public/assets/generated/`.
2.  Automatically inject/update references in `README.md`.

If you add new features, please consider adding a corresponding card in `scripts/generate_assets.py`.

## �📜 License

By contributing, you agree that your contributions will be licensed under its MIT License.

---

**Happy Coding!** 🍭
