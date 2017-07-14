import {FrameworkComponentWrapper} from "./componentProvider";
import {IComponent} from "./interfaces/iComponent";

export interface WrapableInterface {
    hasMethod(name: string): Function
    callMethod(name: string, args: IArguments): Function
    addMethod(name:string, callback:Function): void
}


export abstract class BaseComponentWrapper<F extends WrapableInterface> implements FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(OriginalConstructor: { new (): any }, mandatoryMethodList: string[], optionalMethodList?: string[]): A {
        let wrapper: F = this.createWrapper(OriginalConstructor);
        mandatoryMethodList.forEach((methodName => {
            this.getOrCreateMethod(wrapper, methodName, true);
        }));

        if (optionalMethodList) {
            optionalMethodList.forEach((methodName => {
                this.getOrCreateMethod(wrapper, methodName, false);
            }));
        }


        return <A><any>wrapper;

    }

    abstract createWrapper(OriginalConstructor: { new (): any }): F;


    private getOrCreateMethod(wrapper: F, methodName: string, mandatory: boolean): void{
        wrapper.addMethod(methodName, this.createMethodProxy(wrapper, methodName, mandatory));
    }

    private createMethodProxy(wrapper: F, methodName: string, mandatory: boolean): Function {
        return function () {
            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments)
            }

            if (mandatory) {
                console.warn('ag-Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        }
    }

}
