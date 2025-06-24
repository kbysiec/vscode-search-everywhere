import * as sinon from "sinon";

interface StubCustomReturn {
  onCall?: number;
  returns?: any;
  withArgs?: any;
  throws?: any;
}

interface StubMultipleConfig {
  object: any;
  method: string;
  returns?: any;
  isNotMethod?: boolean;
  throws?: any;
  customReturns?: boolean;
  returnsIsUndefined?: boolean;
  callsFake?: any;
}

interface RestoreStubbedMultipleConfig {
  object: any;
  method: string;
}

export const stubMultiple = (
  configList: StubMultipleConfig[],
  overridenSandox?: sinon.SinonSandbox
): sinon.SinonStub<any[], any>[] => {
  const sandbox = overridenSandox || sinon;
  const stubs: sinon.SinonStub<any[], any>[] = [];
  configList.forEach((config: StubMultipleConfig) => {
    let stub = sandbox.stub(config.object, config.method);

    if (config.callsFake) {
      !config.isNotMethod && stub.returns(config.returns);
    } else if (config.customReturns) {
      config.returns &&
        config.returns.length &&
        config.returns.forEach(stubOnSpecificCall.bind(null, config, stub));
    } else if (config.returnsIsUndefined) {
      config.isNotMethod ? stub.value(undefined) : stub.returns(undefined);
    } else {
      config.returns && config.isNotMethod
        ? stub.value(config.returns)
        : stub.returns(config.returns);
    }

    config.throws && stub.throws(config.throws);
    config.callsFake && !config.isNotMethod && stub.callsFake(config.callsFake);

    stubs.push(stub);
  });

  return stubs;
};

export const restoreStubbedMultiple = (
  configList: RestoreStubbedMultipleConfig[]
) => {
  configList.forEach((config: RestoreStubbedMultipleConfig) => {
    config.object[config.method].restore();
  });
};
function stubOnSpecificCall(
  config: StubMultipleConfig,
  stub: sinon.SinonStub<any[], any>,
  customReturn: StubCustomReturn
) {
  let onCallStub: sinon.SinonStub<any[], any>;
  if (customReturn.onCall !== undefined) {
    onCallStub = stub.onCall(customReturn.onCall);

    if (customReturn.throws) {
      onCallStub.throws(customReturn.throws);
    } else {
      onCallStub = customReturn.withArgs
        ? onCallStub.withArgs(customReturn.withArgs)
        : onCallStub;
      onCallStub = config.isNotMethod
        ? onCallStub.value(customReturn.returns)
        : onCallStub.returns(customReturn.returns);
    }
  }
}
