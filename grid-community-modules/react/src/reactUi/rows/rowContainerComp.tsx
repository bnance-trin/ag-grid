import { getRowContainerTypeForName, IRowContainerComp, RowContainerCtrl, RowContainerName, RowCtrl } from '@ag-grid-community/core';
import React, { useMemo, useRef, useState, memo, useContext, useCallback } from 'react';
import { classesList, agFlushSync, getNextValue } from '../utils';
import useReactCommentEffect from '../reactComment';
import RowComp from './rowComp';
import { BeansContext } from '../beansContext';

const RowContainerComp = (params: {name: RowContainerName}) => {

    const {context} = useContext(BeansContext);

    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState<RowCtrl[]>([]);

    const { name } = params;
    const containerType = useMemo(() => getRowContainerTypeForName(name), [name]);

    const eWrapper = useRef<HTMLDivElement | null>(null);
    const eViewport = useRef<HTMLDivElement | null>(null);
    const eContainer = useRef<HTMLDivElement | null>(null);

    const rowCtrlsRef = useRef<RowCtrl[]>([]);
    const domOrderRef = useRef<boolean>(false);
    const rowContainerCtrlRef = useRef<RowContainerCtrl | null>();

    const cssClasses = useMemo(() => RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const wrapperClasses = useMemo( ()=> classesList(cssClasses.wrapper), []);
    const viewportClasses = useMemo( ()=> classesList(cssClasses.viewport), []);
    const containerClasses = useMemo( ()=> classesList(cssClasses.container), []);

    // no need to useMemo for boolean types
    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER 
                    || name === RowContainerName.BOTTOM_CENTER 
                    || name === RowContainerName.STICKY_TOP_CENTER;
    const template3 = !template1 && !template2;

    const topLevelRef = template1 ? eWrapper : template2 ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    function updateRowCtrlsOrdered(useFlushSync: boolean) {
        agFlushSync(useFlushSync, () => {
            setRowCtrlsOrdered(prev => getNextValue(prev, rowCtrlsRef.current, domOrderRef.current)!);
        })
    }

    const areElementsReady = useCallback(() => {
        if (template1) {
            return eWrapper.current != null && eViewport.current != null && eContainer.current != null;
        }
        if (template2) {
            return eViewport.current != null && eContainer.current != null;
        }
        if (template3) {
            return eContainer.current != null;
        }
    }, []);

    const areElementsRemoved = useCallback(() => {
        if (template1) {
            return eWrapper.current == null && eViewport.current == null && eContainer.current == null;
        }
        if (template2) {
            return eViewport.current == null && eContainer.current == null;
        }
        if (template3) {
            return eContainer.current == null;
        }
    }, []);

    const setRef = useCallback(() => {
        if (areElementsRemoved()) {
            context.destroyBean(rowContainerCtrlRef.current);
            rowContainerCtrlRef.current = null;
        }
        if (areElementsReady()) {
            const compProxy: IRowContainerComp = {
                setViewportHeight: (height: string) => {
                    if (eViewport.current) {
                        eViewport.current.style.height = height;
                    }
                },
                setRowCtrls: (rowCtrls, useFlushSync) => {
                    //If the reference is the same, we don't need to do anything, or if both are empty
                    if(rowCtrlsRef.current === rowCtrls || (rowCtrlsRef.current.length === 0 && rowCtrls.length === 0)) {
                        return;
                    }
                    const useFlush = useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered(useFlush);
                },
                setDomOrder: domOrder => {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered(false);
                    }
                },
                setContainerWidth: width => {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                }
            }

            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current!, eViewport.current!, eWrapper.current!);
        }

    }, [areElementsReady, areElementsRemoved]);

    const setContainerRef = useCallback((e: HTMLDivElement) => {
        eContainer.current = e;
        setRef();
    }, [setRef]);
    const setViewportRef = useCallback((e: HTMLDivElement) => {
        eViewport.current = e;
        setRef();
    }, [setRef]);
    const setWrapperRef = useCallback((e: HTMLDivElement) => {
        eWrapper.current = e;
        setRef();
    }, [setRef]);

    const buildContainer = () => (
        <div
            className={ containerClasses }
            ref={setContainerRef}
            role={ rowCtrlsOrdered.length ? "rowgroup" : "presentation" }
        >
            {
                rowCtrlsOrdered.map(rowCtrl =>
                    <RowComp rowCtrl={ rowCtrl } containerType={ containerType } key={ rowCtrl.getInstanceId() }></RowComp>
                )
            }
        </div>
    );

    return (
        <>
            {
                template1 &&
                <div className={wrapperClasses} ref={setWrapperRef} role="presentation">
                    <div className={viewportClasses} ref={setViewportRef} role="presentation">
                        { buildContainer() }
                    </div>
                </div>
            }
            {
                template2 &&
                <div className={viewportClasses} ref={setViewportRef} role="presentation">
                    { buildContainer() }
                </div>
            }
            {
                template3 && buildContainer()
            }
        </>
    );
};

export default memo(RowContainerComp);
