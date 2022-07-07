// import { assert } from "chai";
// import DataConverter from "../../dataConverter";
// import { getConfigStub } from "../util/stubFactory";
// // import Utils from "../../utils";
// import Config from "../../config";
// import { getTestSetups } from "../testSetup/dataConverter.testSetup";

// describe("DataConverter", () => {
//   // let utilsStub: Utils = getUtilsStub();
//   let configStub: Config = getConfigStub();
//   let dataConverter: DataConverter = new DataConverter(configStub);
//   let setups = getTestSetups(dataConverter);

//   beforeEach(() => {
//     // utilsStub = getUtilsStub();
//     configStub = getConfigStub();
//     dataConverter = new DataConverter(configStub);
//     setups = getTestSetups(dataConverter);
//   });

//   describe("reload", () => {
//     it("1: should fetchConfig method be invoked", () => {
//       const [fetchConfigStub] = setups.reload1();
//       dataConverter.reload();

//       assert.equal(fetchConfigStub.calledOnce, true);
//     });
//   });

//   describe("cancel", () => {
//     it("1: should setCancelled method be invoked with true parameter", () => {
//       const [setCancelledStub] = setups.cancel1();
//       dataConverter.cancel();

//       assert.equal(setCancelledStub.calledOnce, true);
//     });
//   });

//   describe("convertToQpData", () => {
//     it("1: should return quick pick data - without icons and filter phrases", () => {
//       const { workspaceData, qpItems } = setups.convertToQpData1();
//       assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
//     });

//     it("2: should return quick pick data - with icons and filter phrases", () => {
//       const { workspaceData, qpItems } = setups.convertToQpData2();
//       assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
//     });

//     it("3: should return empty array", () => {
//       const { workspaceData, qpItems } = setups.convertToQpData3();
//       assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
//     });

//     it("4: should return empty array if isCancelled equal to true", () => {
//       const { workspaceData, qpItems } = setups.convertToQpData4();
//       assert.deepEqual(dataConverter.convertToQpData(workspaceData), qpItems);
//     });
//   });
// });
