import { browserContext, browserReport, getBrowser, getOperatingSystem, getVersion, isMobile } from "./browser-scout.js";

const context = browserContext();

it("browser-scout A instance in test context", () => {
  expect(context).toMatchInlineSnapshot(`
    {
      "browser": "Unknown browser",
      "isInternetExplorer": false,
      "isMobile": false,
      "language": "Unknown language",
      "os": "Unknown OS",
      "platform": "Unknown platform",
      "screenHeight": 0,
      "screenWidth": 0,
      "url": "Unknown url",
      "userAgent": "Unknown user agent",
      "version": "Unknown version",
    }
  `);
});

it("browser-scout B report", () => {
  expect(browserReport(context)).toMatchInlineSnapshot(`
    "
     - Browser : Unknown browser Unknown version
     - Language : Unknown language
     - OS : Unknown OS
     - Platform : Unknown platform
     - Is mobile : false
     - Screen : 0x0
     - Url : Unknown url
     - User agent : Unknown user agent
     "
  `);
});

// Chrome 112 desktop Windows 10 x64
const userAgentA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
it("getBrowser A", () => {
  expect(getBrowser(userAgentA)).toMatchInlineSnapshot('"Chrome"');
});
it("getVersion A", () => {
  expect(getVersion(userAgentA)).toMatchInlineSnapshot('"112.0.0.0"');
});
it("getOperatingSystem A", () => {
  expect(getOperatingSystem(userAgentA)).toMatchInlineSnapshot('"Windows"');
});
it("isMobile A", () => {
  expect(isMobile(userAgentA)).toBe(false);
});

const userAgentB = "Weird user agent";
it("getBrowser B", () => {
  expect(getBrowser(userAgentB)).toMatchInlineSnapshot('"Unknown browser"');
});
it("getVersion B", () => {
  expect(getVersion(userAgentB)).toMatchInlineSnapshot('"Unknown version"');
});
it("getOperatingSystem B", () => {
  expect(getOperatingSystem(userAgentB)).toMatchInlineSnapshot('"Unknown OS"');
});
it("isMobile B", () => {
  expect(isMobile(userAgentB)).toBe(false);
});

// Samsung Galaxy S22 Android 12
const userAgentC = "Mozilla/5.0 (Linux; Android 12; SM-S906N Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36";
it("getBrowser C", () => {
  expect(getBrowser(userAgentC)).toMatchInlineSnapshot('"Chrome"');
});
it("getVersion C", () => {
  expect(getVersion(userAgentC)).toMatchInlineSnapshot('"80.0.3987.119"');
});
it("getOperatingSystem C", () => {
  expect(getOperatingSystem(userAgentC)).toMatchInlineSnapshot('"Android"');
});
it("isMobile C", () => {
  expect(isMobile(userAgentC)).toBe(true);
});

// iPhone 13 Pro Max iOS 15
const userAgentD = "Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1";
it("getBrowser D", () => {
  expect(getBrowser(userAgentD)).toMatchInlineSnapshot('"Safari"');
});
it("getVersion D", () => {
  expect(getVersion(userAgentD)).toMatchInlineSnapshot('"10.0"');
});
it("getOperatingSystem D", () => {
  expect(getOperatingSystem(userAgentD)).toMatchInlineSnapshot('"iOS"');
});
it("isMobile D", () => {
  expect(isMobile(userAgentD)).toBe(true);
});

// Windows 10-based PC using Edge browser
const userAgentE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246";
it("getBrowser E", () => {
  expect(getBrowser(userAgentE)).toMatchInlineSnapshot('"Edge"');
});
it("getVersion E", () => {
  expect(getVersion(userAgentE)).toMatchInlineSnapshot('"12.246"');
});
it("getOperatingSystem E", () => {
  expect(getOperatingSystem(userAgentE)).toMatchInlineSnapshot('"Windows"');
});
it("isMobile E", () => {
  expect(isMobile(userAgentE)).toBe(false);
});

// Chrome OS-based laptop using Chrome browser (Chromebook)
const userAgentF = "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36";
it("getBrowser F", () => {
  expect(getBrowser(userAgentF)).toMatchInlineSnapshot('"Chrome"');
});
it("getVersion F", () => {
  expect(getVersion(userAgentF)).toMatchInlineSnapshot('"51.0.2704.64"');
});
it("getOperatingSystem F", () => {
  expect(getOperatingSystem(userAgentF)).toMatchInlineSnapshot('"Chrome OS"');
});
it("isMobile F", () => {
  expect(isMobile(userAgentF)).toBe(false);
});

// Mac OS X-based computer using a Safari browser
const userAgentG = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9";
it("getBrowser G", () => {
  expect(getBrowser(userAgentG)).toMatchInlineSnapshot('"Safari"');
});
it("getVersion G", () => {
  expect(getVersion(userAgentG)).toMatchInlineSnapshot('"9.0.2"');
});
it("getOperatingSystem G", () => {
  expect(getOperatingSystem(userAgentG)).toMatchInlineSnapshot('"Mac OS"');
});
it("isMobile G", () => {
  expect(isMobile(userAgentG)).toBe(false);
});

// Linux-based PC using a Firefox browser
const userAgentH = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1";
it("getBrowser H", () => {
  expect(getBrowser(userAgentH)).toMatchInlineSnapshot('"Firefox"');
});
it("getVersion H", () => {
  expect(getVersion(userAgentH)).toMatchInlineSnapshot('"15.0.1"');
});
it("getOperatingSystem H", () => {
  expect(getOperatingSystem(userAgentH)).toMatchInlineSnapshot('"Linux"');
});
it("isMobile H", () => {
  expect(isMobile(userAgentH)).toBe(false);
});

// Internet Explorer 11
const userAgentI = "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko";
it("getBrowser I", () => {
  expect(getBrowser(userAgentI)).toMatchInlineSnapshot('"Internet Explorer"');
});
it("getVersion I", () => {
  expect(getVersion(userAgentI)).toMatchInlineSnapshot('"11.0"');
});
it("getOperatingSystem I", () => {
  expect(getOperatingSystem(userAgentI)).toMatchInlineSnapshot('"Windows"');
});
it("isMobile I", () => {
  expect(isMobile(userAgentI)).toBe(false);
});

// Internet Explorer 10
const userAgentJ = "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)";
it("getBrowser J", () => {
  expect(getBrowser(userAgentJ)).toMatchInlineSnapshot('"Internet Explorer"');
});
it("getVersion J", () => {
  expect(getVersion(userAgentJ)).toMatchInlineSnapshot('"10.0"');
});
it("getOperatingSystem J", () => {
  expect(getOperatingSystem(userAgentJ)).toMatchInlineSnapshot('"Windows"');
});
it("isMobile J", () => {
  expect(isMobile(userAgentJ)).toBe(false);
});

it("getVersion K should handle regex match without version group", () => {
  const userAgentK = "TestBrowser/NoVersion";
  expect(getVersion(userAgentK)).toBe("Unknown version");
});

it("getBrowser with no match returns Unknown browser", () => {
  // An empty string should match the catch-all /./u regex
  const result = getBrowser("");
  expect(result).toBe("Unknown browser");
});

it("getOperatingSystem with no match returns Unknown OS", () => {
  // An empty string should match the catch-all /./u regex
  const result = getOperatingSystem("");
  expect(result).toBe("Unknown OS");
});

it("browserContext should return valid context object", () => {
  const ctx = browserContext();
  expect(ctx).toHaveProperty("browser");
  expect(ctx).toHaveProperty("isInternetExplorer");
  expect(ctx).toHaveProperty("isMobile");
  expect(ctx).toHaveProperty("language");
  expect(ctx).toHaveProperty("os");
  expect(ctx).toHaveProperty("platform");
  expect(ctx).toHaveProperty("screenHeight");
  expect(ctx).toHaveProperty("screenWidth");
  expect(ctx).toHaveProperty("url");
  expect(ctx).toHaveProperty("userAgent");
  expect(ctx).toHaveProperty("version");
});
