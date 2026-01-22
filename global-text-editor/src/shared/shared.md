
## ToolbarIcon
ToolbarIcon is mainly used inside `button`, and simply returns an icon for the button. Based on the theme color, or some attributes like `onlyBlackIcon` or `size`, it is customizable. It is mainly used to render buttons inside `DropdownOverlay`, or as a single button.

## DropdownOverlay
DropdownOverlay is a universal dropdown component that can be used overall the app. To allow components to adapt this usability, you need to explicitly pass `buttons` you need into it as children. It has some attributes like `align`, `activeCheck`, and `scrollable` to be appliable in several cases.
