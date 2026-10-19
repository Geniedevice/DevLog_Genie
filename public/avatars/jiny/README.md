# JINY animated avatar

Built from the approved redesign with Rev2D (MIT, RevStudio).

- `avatar.json`: editable source landmarks and motion settings, in the 1254 × 1254 source image's pixel coordinates.
- `source.png`: original approved illustration.
- `jiny.r2d.json`: generated model: 24 drawable parts, 25 parameters, 10 deformers, 14 physics groups.
- `textures/`: separate base, eye ball/lid/crease/rim/foreground, mouth, hair and ribbon PNG layers. Hair locks share a texture and have eight independently driven mesh regions. The head, torso, cape and brooch use mesh deformers; they are not separate hand-painted PSD layers.
- `live2d/`: six Cubism motion JSON files, physics and display information. This is a **partial interchange export**, not a Cubism model: there is no `.moc3`. Physics translation is approximate. These files need an actual Cubism-authored model with matching parameter IDs to work in the Cubism SDK.

The site runs the textured Rev2D WebGL2 engine, not the Live2D Cubism SDK. It provides blinking, pointer gaze and head movement, breathing, hair/ribbon physics and click expressions. It pauses outside the viewport and in background tabs, respects reduced motion, and keeps the original PNG if loading fails or WebGL2 is unavailable.

Rebuild from this repository using `node scripts/rev2d-jiny.mjs avatar build public/avatars/jiny`, then `avatar poses` to review. The helper uses the local Desktop Rev2D checkout, with its alpha threshold adjusted to 240 because the generated illustration's opaque regions have alpha values around 252. It does not modify that checkout.

The extraction approximates newly exposed pixels behind hair/accessories. Moderate head turns preserve the painted three-quarter perspective. Two ribbon cutouts are trimmed by Rev2D's automatic object classifier; their remaining pixels follow the head warp. Larger turns and extreme closed-eye poses still warrant hand-painted replacement layers for production illustration quality.
