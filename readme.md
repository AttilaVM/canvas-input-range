# HTML Canvas range input.

## prerequisites

### Uniform and same image sizes

Both rail and knob image must have uniform scales (they must be a drawn inside a square) and must have the same size.
###  Disable preserveAspectRatio

When you use SVG the `preserveAspectRatio` attribute must be set to `"none"` on the svg root element. In the absence of the attribute Firefox will default to `XMidYMid`, which will prevent the non-uniform scaling of your rail image.
## Hints

Set `user-select` CSS property to `none` for your slider to prevent users from accidently selecting it.
