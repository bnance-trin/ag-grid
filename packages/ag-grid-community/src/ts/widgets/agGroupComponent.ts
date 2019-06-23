import { _ } from "../utils";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import {AgCheckbox} from "./agCheckbox";

type GroupItem = Component | HTMLElement;

interface GroupParams {
    title: string;
    enabled: boolean;
    suppressEnabledCheckbox: boolean;
    items?: GroupItem[];
}

export class AgGroupComponent extends Component {
    private static TEMPLATE =
        `<div class="ag-group-component">
            <div class="ag-group-component-label">
                <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
                <div ref="lbGroupTitle" class="ag-group-component-title"></div>
            </div>
            <div ref="eContainer" class="ag-group-component-container"></div>
        </div>`;

    private items: GroupItem[];
    private title: string;
    private enabled: boolean;
    private suppressEnabledCheckbox: boolean;

    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector("lbGroupTitle") private lbGroupTitle: HTMLElement;
    @RefSelector("eContainer") private groupContainer: HTMLElement;

    constructor(params?: GroupParams) {
        super(AgGroupComponent.TEMPLATE);

        if (!params) {
            params = {} as GroupParams;
        }

        this.title = params.title;
        this.enabled = params.enabled;
        this.suppressEnabledCheckbox = params.suppressEnabledCheckbox;
        this.items = params.items || [];
    }

    @PostConstruct
    private postConstruct() {
        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        if (this.title) {
            this.setTitle(this.title);
        }

        if (this.enabled) {
            this.setEnabled(this.enabled);
        }

        if (this.suppressEnabledCheckbox) {
            this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        }
    }

    public addItems(items: GroupItem[]) {
        items.forEach(item => this.addItem(item));
    }

    public addItem(item: GroupItem) {
        const container = this.groupContainer;
        const el = item instanceof Component ? item.getGui() : item;
        _.addCssClass(el, 'ag-group-item');

        container.appendChild(el);
        this.items.push(el);
    }

    public setTitle(title: string): this {
        this.lbGroupTitle.innerText = title;
        return this;
    }

    public setEnabled(enabled: boolean, skipToggle?: boolean): this {
        if (this.suppressEnabledCheckbox) {
            return this;
        }
        _.addOrRemoveCssClass(this.getGui(), 'ag-disabled', !enabled);
        this.enabled = enabled;

        if (!skipToggle) {
            this.cbGroupEnabled.setSelected(enabled);
        }
        return this;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public onEnableChange(callbackFn: (enabled: boolean) => void): this {
        this.cbGroupEnabled.onSelectionChange((newSelection: boolean) => {
            this.setEnabled(newSelection, true);
            callbackFn(newSelection);
        });
        return this;
    }

    public hideEnabledCheckbox(hide: boolean): this {
        _.addOrRemoveCssClass(this.cbGroupEnabled.getGui(), 'ag-hidden', hide);
        return this;
    }
}