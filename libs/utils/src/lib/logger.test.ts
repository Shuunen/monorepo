import { red } from "./colors.js";
import { Logger } from "./logger.js";
import { Result } from "./result.js";

it("logger A", () => {
  const loggerA = new Logger();
  expect(loggerA.options.isActive).toBe(true);
  loggerA.info("This info 0 should be logged");
});

it("logger B", () => {
  const loggerB = new Logger({
    isActive: false,
    willLogDelay: false,
    willOutputToConsole: false,
    willOutputToMemory: true,
  });
  expect(loggerB.options.isActive).toBe(false);
  loggerB.info("This info 1 should not be logged");
  loggerB.options.isActive = true;
  loggerB.info("This info 2 should be logged");
  loggerB.info("This info 3 should be logged too");
  loggerB.success("This success 0 should be logged");
  loggerB.warn("This warn 1 should be logged");
  loggerB.fix("This fix 1 should be logged", 42);
  loggerB.error("This error 0 should be logged", { isKeyA: true, keyB: "John" });
  loggerB.error(new Error("This error 1 should be logged too"));
  expect(loggerB.inMemoryLogs).toMatchSnapshot();
});

it("logger C", () => {
  const loggerC = new Logger({
    minimumLevel: "7-error",
    willLogDate: true,
    willLogDelay: true,
    willLogTime: true,
    willOutputToConsole: false,
    willOutputToMemory: true,
  });
  loggerC.warn("This warn 2 should not be logged");
  loggerC.success("This success 1 should not be logged");
  loggerC.error("This error 1 should be logged");
  loggerC.disable();
  loggerC.error("This error 2 should not be logged");
  loggerC.enable();
  loggerC.error("This error 3 should be logged");
  loggerC.test(true, "This test 1 should not be logged");
  loggerC.options.minimumLevel = "2-test";
  loggerC.test(true, "This test 2 should be logged");
  loggerC.test(false, "This test 3 should be logged");
  // cannot use checkSnapshot because of the date
  expect(loggerC.inMemoryLogs.length, "loggerC has 4 inMemoryLogs").toBe(4);
});

it("logger D", () => {
  const loggerD = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  loggerD.info("This info 4 should be logged", 12);
  loggerD.info("This info 5 should be logged too", [1, 2, 3]);
  loggerD.warn("This warn 3 should be logged", { isKeyC: true, keyA: 1, keyB: "John" });
  loggerD.disable();
  loggerD.warn("This warn 4 should not be logged");
  loggerD.error("This error 4 should not be logged");
  loggerD.enable();
  loggerD.error("This error 5 should be logged", null);
  loggerD.test(true, "This test 4 should be logged", undefined);
  loggerD.test(false, "This test 5 should be logged", () => "Hello world");
  loggerD.debug("This debug 1 should be logged", true, [], {});
  loggerD.options.minimumLevel = "3-info";
  loggerD.debug("This debug 2 should not be logged");
  expect(loggerD.inMemoryLogs).toMatchSnapshot();
});

const loggerE = new Logger({ willOutputToConsole: false });
it("logger clean A", () => {
  expect(loggerE.clean()).toBe("");
});
it("logger clean B", () => {
  expect(loggerE.clean(red("Oh I'm in red now ?!"))).toMatchInlineSnapshot('"Oh I\'m in red now ?!"');
});
it("logger clean C", () => {
  expect(loggerE.clean("an array ?", [12, 42])).toMatchInlineSnapshot('"an array ? [12,42]"');
});
it("logger clean D", () => {
  expect(loggerE.clean("a function ?", () => "Hello world")).toMatchInlineSnapshot("\"a function ? () => 'Hello world'\"");
});
it("logger clean E", () => {
  expect(loggerE.clean("an object ?", { isFull: true, keyA: 1, keyB: "John" })).toMatchInlineSnapshot("\"an object ? {'isFull':true,'keyA':1,'keyB':'John'}\"");
});
it("logger clean F", () => {
  expect(loggerE.clean("a boolean ?", true)).toMatchInlineSnapshot('"a boolean ? true"');
});
it("logger clean G", () => {
  expect(loggerE.clean("a number ?", 42)).toMatchInlineSnapshot('"a number ? 42"');
});
it("logger clean H", () => {
  expect(loggerE.clean("a string ?", "Hello world")).toMatchInlineSnapshot('"a string ? Hello world"');
});
it("logger clean I", () => {
  expect(loggerE.clean("a null ?", null)).toMatchInlineSnapshot('"a null ? null"');
});
it("logger clean J", () => {
  expect(loggerE.clean("an undefined ?", undefined)).toMatchInlineSnapshot('"an undefined ? undefined"');
});
it("logger clean K", () => {
  expect(loggerE.clean("a date ?", new Date("2020-01-01"))).toMatchInlineSnapshot(`"a date ? {'__date__':'2020-01-01T00:00:00.000Z'}"`);
});
it("logger clean L", () => {
  expect(loggerE.clean("a regexp ?", /Hello world{3,5}/u)).toMatchInlineSnapshot(`"a regexp ? {'__regexFlags__':'u','__regexSource__':'Hello world{3,5}'}"`);
}); // not supported for now

it("logger F show", () => {
  const loggerF = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  loggerF.showInfo("This info 1 should be logged", 12);
  loggerF.info("This info 2 should be logged too", [1, 2, 3]);
  loggerF.warn("This warn 3 should be logged", { isKeyC: true, keyA: 1, keyB: "John" });
  loggerF.showError("This error 4 should not be logged");
  loggerF.error("This error 5 should be logged", null);
  loggerF.showSuccess("This success 6 should be logged", 12);
  loggerF.test(true, "This test 7 should be logged", undefined);
  loggerF.test(false, "This test 8 should be logged", () => "Hello world");
  loggerF.debug("This debug 9 should be logged", true, [], {});
  loggerF.options.minimumLevel = "3-info";
  loggerF.debug("This debug 10 should not be logged");
  expect(loggerF.inMemoryLogs).toMatchSnapshot();
});

it("logger result A should log ok result with default levels", () => {
  const loggerG = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const okResult = Result.ok({ data: "success" });
  loggerG.result("test operation", okResult);
  expect(loggerG.inMemoryLogs).toMatchSnapshot();
});

it("logger result B should log error result with default levels", () => {
  const loggerH = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const errorResult = Result.error("something went wrong");
  loggerH.result("test operation", errorResult);
  expect(loggerH.inMemoryLogs).toMatchSnapshot();
});

it("logger result C should log ok result with custom levels", () => {
  const loggerI = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const okResult = Result.ok(42);
  loggerI.result("test operation", okResult, "success", "warn");
  expect(loggerI.inMemoryLogs).toMatchSnapshot();
});

it("logger result D should log error result with custom levels", () => {
  const loggerJ = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const errorResult = Result.error("custom error");
  loggerJ.result("test operation", errorResult, "success", "warn");
  expect(loggerJ.inMemoryLogs).toMatchSnapshot();
});

it("logger showResult A should log ok result with default levels", () => {
  const loggerK = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const okResult = Result.ok({ data: "success" });
  loggerK.showResult("test operation", okResult);
  expect(loggerK.inMemoryLogs).toMatchSnapshot();
});

it("logger showResult B should log error result with default levels", () => {
  const loggerL = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const errorResult = Result.error("something went wrong");
  loggerL.showResult("test operation", errorResult);
  expect(loggerL.inMemoryLogs).toMatchSnapshot();
});

it("logger showResult C should log ok result with custom levels", () => {
  const loggerM = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const okResult = Result.ok(42);
  loggerM.showResult("test operation", okResult, "success", "warn");
  expect(loggerM.inMemoryLogs).toMatchSnapshot();
});

it("logger showResult D should log error result with custom levels", () => {
  const loggerN = new Logger({ willLogDelay: false, willOutputToConsole: false, willOutputToMemory: true });
  const errorResult = Result.error("custom error");
  loggerN.showResult("test operation", errorResult, "success", "warn");
  expect(loggerN.inMemoryLogs).toMatchSnapshot();
});
