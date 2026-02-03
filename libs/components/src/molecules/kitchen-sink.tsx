import { useId } from "react";

function ColorPaletteItem({ classes }: { classes: string }) {
  return (
    <div className={`flex flex-col justify-center rounded-lg p-4 text-center shadow-lg ${classes}`}>
      {classes.split(" ").map(className => (
        <div className="whitespace-nowrap" key={className}>
          {className}
        </div>
      ))}
    </div>
  );
}

function ColorPalette() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ColorPaletteItem classes="bg-background text-foreground" />
      <ColorPaletteItem classes="bg-card text-card-foreground" />

      <ColorPaletteItem classes="bg-primary text-primary-foreground" />
      <ColorPaletteItem classes="bg-secondary text-secondary-foreground" />

      <ColorPaletteItem classes="bg-muted text-muted-foreground" />
      <ColorPaletteItem classes="bg-accent text-accent-foreground" />

      <ColorPaletteItem classes="bg-destructive text-destructive-foreground" />
      <ColorPaletteItem classes="bg-destructive-foreground border-2 border-destructive text-destructive" />

      <ColorPaletteItem classes="bg-success text-success-foreground" />
      <ColorPaletteItem classes="bg-success-foreground border-2 border-success text-success" />

      <ColorPaletteItem classes="bg-warning text-warning-foreground" />
      <ColorPaletteItem classes="bg-warning-foreground border-2 border-warning text-warning" />

      <ColorPaletteItem classes="bg-info text-info-foreground" />
      <ColorPaletteItem classes="bg-info-foreground border-2 border-info text-info" />

      <ColorPaletteItem classes="bg-chart-1 text-white" />
      <ColorPaletteItem classes="bg-white border-2 border-chart-1 text-chart-1" />

      <ColorPaletteItem classes="bg-chart-2 text-white" />
      <ColorPaletteItem classes="bg-white border-2 border-chart-2 text-chart-2" />

      <ColorPaletteItem classes="bg-chart-3 text-white" />
      <ColorPaletteItem classes="bg-white border-2 border-chart-3 text-chart-3" />

      <ColorPaletteItem classes="bg-chart-4 text-white" />
      <ColorPaletteItem classes="bg-white border-2 border-chart-4 text-chart-4" />

      <ColorPaletteItem classes="bg-chart-5 text-white" />
      <ColorPaletteItem classes="bg-white border-2 border-chart-5 text-chart-5" />
    </div>
  );
}

export function KitchenSink() {
  return (
    <div
      className="flex min-h-screen flex-col"
      id={`kitchen-sink-${useId()}`}
      style={{ background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)" }}
    >
      <div className="container mx-auto prose pt-24 lg:prose-lg">
        <h1>Components</h1>
        <p>This kitchen sink let you see and experiment the catalog of components and the default styles provided.</p>
        <p>
          If you want to check the StoryBook, simply run <code>pnpm sb</code>.
        </p>

        <h2>Typography</h2>
        <h3>
          Option 1 : use the <code>prose</code> class
        </h3>
        <p>
          This current page is using the prose class to style the typography. If you inspect the elements, you will see
          that the <code>prose</code> class is applied to the container and that the typography elements like{" "}
          <code>h1</code>, <code>h2</code>, and <code>p</code> are styled without any classes on them.
        </p>

        <h3>Option 2 : customize everything</h3>
        <p>
          If you don't want to use the <code>prose</code> class, you can customize the typography styles by applying
          Tailwind CSS classes directly to the unstyled elements.
        </p>
        <p>For example :</p>
        <p className="text-lg">This is a paragraph with large text.</p>
        <p className="text-base">This is a paragraph with base text.</p>
        <p className="text-sm">This is a paragraph with small text.</p>

        <h3>Links</h3>
        <p>
          Links are styled using the <code>prose</code> class as well. You can see that they have a{" "}
          <a href="#kitchen-sink">default color</a>, an underline and a hover effect.
        </p>

        <h2>Colors</h2>
        <ColorPalette />
      </div>
    </div>
  );
}
