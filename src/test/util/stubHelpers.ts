import * as sinon from "sinon";

interface StubCustomReturn {
  onCall?: number;
  returns?: any;
  withArgs?: any;
}

interface StubMultipleConfig {
  object: any;
  method: string;
  returns?: any;
  isNotMethod?: boolean;
  throws?: any;
  customReturns?: boolean;
  returnsIsUndefined?: boolean;
}

interface RestoreStubbedMultipleConfig {
  object: any;
  method: string;
}

export const stubMultiple = (
  configList: StubMultipleConfig[]
): sinon.SinonStub<any[], any>[] => {
  const stubs: sinon.SinonStub<any[], any>[] = [];
  configList.forEach((config: StubMultipleConfig) => {
    let stub = sinon.stub(config.object, config.method);
    if (config.customReturns) {
      config.returns &&
        config.returns.length &&
        config.returns.forEach((customReturn: StubCustomReturn) => {
          stub = customReturn.onCall ? stub.onCall(customReturn.onCall) : stub;
          stub = customReturn.withArgs
            ? stub.withArgs(customReturn.withArgs)
            : stub;
          stub = config.isNotMethod
            ? stub.value(customReturn.returns)
            : stub.returns(customReturn.returns);
        });
    } else if (config.returnsIsUndefined) {
      config.isNotMethod ? stub.value(undefined) : stub.returns(undefined);
    } else {
      config.returns && config.isNotMethod
        ? stub.value(config.returns)
        : stub.returns(config.returns);
    }

    config.throws && stub.throws(config.throws);

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
