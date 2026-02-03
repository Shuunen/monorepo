// oxlint-disable no-magic-numbers
import { AutoForm, Button, field, step, Title } from "@monorepo/components";
import { copyToClipboard, Logger } from "@monorepo/utils";
import { useState } from "react";
import { z } from "zod";
import { Criteria } from "./criteria";

const uploadStep = step(
  z.object({
    logoFile: field(z.file(), { label: "Logo file" }),
    logoIconFile: field(z.file(), { label: "Icon file" }),
  }),
);

const defaultFiles = {
  icon: "https://i.imgur.com/dhzaOgY.png",
  logo: "https://i.imgur.com/zo0aebs.png",
};

const logger = new Logger();

// oxlint-disable-next-line max-lines-per-function
export function App() {
  const [logoSrc, setLogoSrc] = useState(defaultFiles.logo);
  const [iconSrc, setIconSrc] = useState(defaultFiles.icon);
  const [points, setPoints] = useState<number[]>([]);
  function onFileUpload(data: Record<string, unknown>) {
    if ("logoFile" in data && data.logoFile instanceof File) {
      const logoUrl = URL.createObjectURL(data.logoFile);
      setLogoSrc(logoUrl);
    }
    if ("logoIconFile" in data && data.logoIconFile instanceof File) {
      const iconUrl = URL.createObjectURL(data.logoIconFile);
      setIconSrc(iconUrl);
    }
  }
  function setPointAtIndex(index: number, pointValue: number) {
    setPoints(prev => {
      const newPoints = [...prev];
      newPoints[index] = pointValue;
      return newPoints;
    });
  }
  async function copyPoints() {
    const pointsString = points.join("\t");
    const result = await copyToClipboard(pointsString);
    logger.showResult("Export", result, "success");
  }
  return (
    <div className="relative mx-auto grid max-w-xl gap-6 p-6">
      <Title className="text-center text-5xl font-light">Logo Tester</Title>
      <Title level={3} variant="muted">
        This web app helps you test how your logo and icon will look like in different scenarios.
      </Title>
      <AutoForm onSubmit={onFileUpload} schemas={[uploadStep]} />
      <hr />
      <div className="card stripped-light">
        <img alt="Logo on light background" className="logo" src={logoSrc} />
      </div>
      <Criteria name="Brand name large, bold, readable" onSelection={pointValue => setPointAtIndex(0, pointValue)} />
      <Criteria name="Inspiring slogan" onSelection={pointValue => setPointAtIndex(1, pointValue)} />
      <Criteria name="Readable slogan" onSelection={pointValue => setPointAtIndex(2, pointValue)} />
      <Criteria name="Tech, computer emotion" onSelection={pointValue => setPointAtIndex(3, pointValue)} />
      <Criteria
        name="Professional, organized, structured emotion"
        onSelection={pointValue => setPointAtIndex(4, pointValue)}
      />
      <Criteria
        name="Human, social, sharing, supportive emotion"
        onSelection={pointValue => setPointAtIndex(5, pointValue)}
      />
      <hr />
      <div className="card stripped-light">
        <img alt="Icon only" className="icon" src={iconSrc} />
      </div>
      <Criteria name="Simple icon" onSelection={pointValue => setPointAtIndex(6, pointValue)} />
      <Criteria name="Self-explanatory icon" onSelection={pointValue => setPointAtIndex(7, pointValue)} />
      <hr />
      <div className="card stripped-light">
        <img alt="Logo on light background" className="logo" src={logoSrc} />
      </div>
      <Criteria name="Readable logo on light background" onSelection={pointValue => setPointAtIndex(8, pointValue)} />
      <hr />
      <div className="card stripped-light">
        <img alt="Logo on light background in grayscale" className="logo grayscale filter" src={logoSrc} />
      </div>
      <Criteria
        name="Readable logo on light background in black and white"
        onSelection={pointValue => setPointAtIndex(9, pointValue)}
      />
      <hr />
      <div className="card bg-transparent">
        <img alt="Logo on transparent background" className="logo" src={logoSrc} />
      </div>
      <Criteria
        name="Readable logo on transparent background"
        onSelection={pointValue => setPointAtIndex(10, pointValue)}
      />
      <hr />
      <div className="card stripped-dark">
        <img alt="Logo on dark background" className="logo" src={logoSrc} />
      </div>
      <Criteria name="Readable logo on dark background" onSelection={pointValue => setPointAtIndex(11, pointValue)} />
      <hr />
      <div className="card stripped-dark">
        <img alt="Logo on dark background inverted grayscale" className="logo grayscale invert filter" src={logoSrc} />
      </div>
      <Criteria
        name="Readable logo on dark background in inverted black and white"
        onSelection={pointValue => setPointAtIndex(12, pointValue)}
      />
      <hr />
      <div className="card stripped-light">
        <img alt="Small logo" className="logo h-16!" src={logoSrc} />
      </div>
      <Criteria name="Readable logo when small" onSelection={pointValue => setPointAtIndex(13, pointValue)} />
      <hr />
      <div className="card stripped-light">
        <img alt="Medium logo" className="logo h-32!" src={logoSrc} />
      </div>
      <Criteria name="Readable logo when medium" onSelection={pointValue => setPointAtIndex(14, pointValue)} />
      <hr />
      <div className="card stripped-light">
        <img alt="Inverted logo" className="logo invert filter" src={logoSrc} />
      </div>
      <Criteria name="Readable logo when inverted" onSelection={pointValue => setPointAtIndex(15, pointValue)} />
      <hr />
      <div className="card">
        <span className="ruler x" />
        <span className="ruler y" />
        <img alt="Logo balance test" className="logo" src={logoSrc} />
      </div>
      <Criteria name="Balanced logo" onSelection={pointValue => setPointAtIndex(16, pointValue)} />
      <hr />
      <div className="card stripped-light grid! grid-cols-3 gap-x-12 px-14! py-12!">
        <img
          alt="Amazon logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png"
        />
        <img
          alt="Coca-Cola logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png"
        />
        <img
          alt="LG logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/600px-LG_logo_%282014%29.svg.png"
        />
        <img
          alt="Microsoft logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png"
        />
        <img
          alt="Google logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1920px-Google_2015_logo.svg.png"
        />
        <img alt="Your logo among famous brands" className="my-5 object-contain" src={logoSrc} />
        <img
          alt="Spotify logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/2024_Spotify_Logo.svg/langfr-1920px-2024_Spotify_Logo.svg.png"
        />
        <img
          alt="Firefox logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Firefox_logo_and_wordmark_%28horizontal%29%2C_2013.png/800px-Firefox_logo_and_wordmark_%28horizontal%29%2C_2013.png"
        />
        <img
          alt="PayPal logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1920px-PayPal.svg.png"
        />
      </div>
      <Criteria name="Unique logo that stands out" onSelection={pointValue => setPointAtIndex(17, pointValue)} />
      <hr />
      <div className="relative">
        <img alt="Android phone mock-up" className="relative z-10 w-xl" src="https://i.imgur.com/w2dOu18.png" />
        <img
          alt="Icon on Android app"
          className="icon absolute z-0 object-contain"
          src={iconSrc}
          style={{ bottom: "79px", right: "205px", width: "30px" }}
        />
      </div>
      <Criteria name="Logo as an app icon" onSelection={pointValue => setPointAtIndex(18, pointValue)} />
      <hr />
      <Button className="mx-auto my-12" disabled={points.length === 0} name="copy" onClick={copyPoints}>
        Copy results to clipboard
      </Button>
    </div>
  );
}
