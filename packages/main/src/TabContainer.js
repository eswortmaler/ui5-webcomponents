import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import ResizeHandler from "@ui5/webcomponents-base/dist/delegate/ResizeHandler.js";
import slideDown from "@ui5/webcomponents-base/dist/animations/slideDown.js";
import slideUp from "@ui5/webcomponents-base/dist/animations/slideUp.js";
import AnimationMode from "@ui5/webcomponents-base/dist/types/AnimationMode.js";
import { getAnimationMode } from "@ui5/webcomponents-base/dist/config/AnimationMode.js";
import ItemNavigation from "@ui5/webcomponents-base/dist/delegate/ItemNavigation.js";
import { isSpace, isEnter } from "@ui5/webcomponents-base/dist/Keys.js";
import MediaRange from "@ui5/webcomponents-base/dist/MediaRange.js";
import { getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import "@ui5/webcomponents-icons/dist/slim-arrow-up.js";
import "@ui5/webcomponents-icons/dist/slim-arrow-down.js";
import {
	TABCONTAINER_PREVIOUS_ICON_ACC_NAME,
	TABCONTAINER_NEXT_ICON_ACC_NAME,
	TABCONTAINER_OVERFLOW_MENU_TITLE,
	TABCONTAINER_END_OVERFLOW,
} from "./generated/i18n/i18n-defaults.js";
import Button from "./Button.js";
import Icon from "./Icon.js";
import List from "./List.js";
import ResponsivePopover from "./ResponsivePopover.js";
import TabContainerTabsPlacement from "./types/TabContainerTabsPlacement.js";

// Templates
import TabContainerTemplate from "./generated/templates/TabContainerTemplate.lit.js";
import TabContainerPopoverTemplate from "./generated/templates/TabContainerPopoverTemplate.lit.js";

// Styles
import tabContainerCss from "./generated/themes/TabContainer.css.js";
import ResponsivePopoverCommonCss from "./generated/themes/ResponsivePopoverCommon.css.js";
import TabLayout from "./types/TabLayout.js";
import TabsOverflowMode from "./types/TabsOverflowMode.js";

const tabStyles = [];
const staticAreaTabStyles = [];

/**
 * @public
 */
const metadata = {
	tag: "ui5-tabcontainer",
	languageAware: true,
	managedSlots: true,
	slots: /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */ {
		/**
		 * Defines the tabs.
		 * <br><br>
		 * <b>Note:</b> Use <code>ui5-tab</code> and <code>ui5-tab-separator</code> for the intended design.
		 *
		 * @type {sap.ui.webcomponents.main.ITab[]}
		 * @public
		 * @slot items
		 */
		"default": {
			propertyName: "items",
			type: HTMLElement,
			individualSlots: true,
			invalidateOnChildChange: {
				properties: true,
				slots: false,
			},
		},

		/**
		 * Defines the button which will open the overflow menu. If nothing is provided to this slot,
		 * the default button will be used.
		 *
		 * @type {sap.ui.webcomponents.main.IButton}
		 * @public
		 * @slot
		 * @since 1.0.0-rc.9
		 */
		overflowButton: {
			type: HTMLElement,
		},

		/**
		 * Defines the button which will open the start overflow menu if available. If nothing is provided to this slot,
		 * the default button will be used.
		 *
		 * @type {sap.ui.webcomponents.main.IButton}
		 * @public
		 * @slot
		 * @since 1.1.0
		 */
		startOverflowButton: {
			type: HTMLElement,
		},
	},
	properties: /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */ {
		/**
		 * Defines whether the tabs are in a fixed state that is not
		 * expandable/collapsible by user interaction.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		fixed: {
			type: Boolean,
		},

		/**
		 * Defines whether the tab content is collapsed.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		collapsed: {
			type: Boolean,
		},

		/**
		 * Defines the placement of the tab strip (tab buttons area) relative to the actual tabs' content.
		 * <br><br>
		 * <b>Note:</b> By default the tab strip is displayed above the tabs' content area and this is the recommended
		 * layout for most scenarios. Set to <code>Bottom</code> only when the component is at the
		 * bottom of the page and you want the tab strip to act as a menu.
		 *
		 * <br><br>
		 * Available options are:
		 * <ul>
		 * <li><code>Top</code></li>
		 * <li><code>Bottom</code></li>
		 * </ul>
		 *
		 * @type {TabContainerTabsPlacement}
		 * @defaultvalue "Top"
		 * @since 1.0.0-rc.7
		 * @private
		 */
		tabsPlacement: {
			type: TabContainerTabsPlacement,
			defaultValue: TabContainerTabsPlacement.Top,
		},

		/**
		 * Defines whether the overflow select list is displayed.
		 * <br><br>
		 * The overflow select list represents a list, where all tab filters are displayed
		 * so that it's easier for the user to select a specific tab filter.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 * @deprecated Since the introduction of TabsOverflowMode overflows will always be visible if there is not enough space for all tabs,
		 * all hidden tabs are moved to a select list in the respective overflows and are accessible via the overflowButton and / or startOverflowButton
		 */
		showOverflow: {
			type: Boolean,
		},

		/**
		 * Defines the alignment of the content and the <code>additionalText</code> of a tab.
		 *
		 * <br><br>
		 * <b>Note:</b>
		 * The content and the <code>additionalText</code> would be displayed vertically by defualt,
		 * but when set to <code>Inline</code>, they would be displayed horizontally.
		 *
		 * <br><br>
		 * Available options are:
		 * <ul>
		 * <li><code>Standard</code></li>
		 * <li><code>Inline</code></li>
		 * </ul>
		 *
		 * @type {TabLayout}
		 * @defaultvalue "Standard"
		 * @public
		 */
		tabLayout: {
			type: String,
			defaultValue: TabLayout.Standard,
		},

		/**
		 * Defines the overflow mode of the tab strip. If you have a large number of tabs, only the tabs that can fit on screen will be visible.
		 * All other tabs that can 't fit on the screen are available in an overflow tab "More".
		 *
		 * <br><br>
		 * <b>Note:</b>
		 * Only one overflow at the end would be displayed by default,
		 * but when set to <code>StartAndEnd</code>, there will be two overflows on both ends, and tab order will not change on tab selection.
		 *
		 * <br><br>
		 * Available options are:
		 * <ul>
		 * <li><code>End</code></li>
		 * <li><code>StartAndEnd</code></li>
		 * </ul>
		 *
		 * @type {TabsOverflowMode}
		 * @defaultvalue "End"
		 * @since 1.1.0
		 * @public
		 */
		tabsOverflowMode: {
			type: TabsOverflowMode,
			defaultValue: TabsOverflowMode.End,
		},

		/**
		 * Defines the current media query size.
		 *
		 * @type {string}
		 * @private
		 */
		mediaRange: {
			type: String,
		},

		_selectedTab: {
			type: Object,
		},

		_animationRunning: {
			type: Boolean,
			noAttribute: true,
		},

		_contentCollapsed: {
			type: Boolean,
			noAttribute: true,
		},

		_startOverflowText: {
			type: String,
			noAttribute: true,
		},

		_endOverflowText: {
			type: String,
			noAttribute: true,
			defaultValue: "More",
		},
	},
	events: /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */ {

		/**
		 * Fired when a tab is selected.
		 *
		 * @event sap.ui.webcomponents.main.TabContainer#tab-select
		 * @param {HTMLElement} tab The selected <code>tab</code>.
		 * @param {Integer} tabIndex The selected <code>tab</code> index.
		 * @public
		 */
		"tab-select": {
			detail: {
				tab: { type: HTMLElement },
				tabIndex: { type: Number },
			},
		},
	},
};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-tabcontainer</code> represents a collection of tabs with associated content.
 * Navigation through the tabs changes the content display of the currently active content area.
 * A tab can be labeled with text only, or icons with text.
 *
 * <h3>Structure</h3>
 *
 * The <code>ui5-tabcontainer</code> can hold two types of entities:
 * <ul>
 * <li><code>ui5-tab</code> - contains all the information on an item (text and icon)</li>
 * <li><code>ui5-tab-separator</code> - used to separate tabs with a vertical line</li>
 * </ul>
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/TabContainer";</code>
 * <br>
 * <code>import "@ui5/webcomponents/dist/Tab";</code> (for <code>ui5-tab</code>)
 * <br>
 * <code>import "@ui5/webcomponents/dist/TabSeparator";</code> (for <code>ui5-tab-separator</code>)
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.TabContainer
 * @extends sap.ui.webcomponents.base.UI5Element
 * @appenddocs Tab TabSeparator
 * @tagname ui5-tabcontainer
 * @public
 */
class TabContainer extends UI5Element {
	static get metadata() {
		return metadata;
	}

	static get styles() {
		return [tabStyles, tabContainerCss];
	}

	static get staticAreaStyles() {
		return [ResponsivePopoverCommonCss, staticAreaTabStyles];
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return TabContainerTemplate;
	}

	static get staticAreaTemplate() {
		return TabContainerPopoverTemplate;
	}

	static registerTabStyles(styles) {
		tabStyles.push(styles);
	}

	static registerStaticAreaTabStyles(styles) {
		staticAreaTabStyles.push(styles);
	}

	constructor() {
		super();

		this._handleResize = this._handleResize.bind(this);

		// Init ItemNavigation
		this._itemNavigation = new ItemNavigation(this, {
			getItemsCallback: () => this._getFocusableTabs(),
		});
	}

	onBeforeRendering() {
		// update selected tab
		const tabs = this._getTabs();
		if (tabs.length) {
			const selectedTabs = tabs.filter(tab => tab.selected);
			if (selectedTabs.length) {
				this._selectedTab = selectedTabs[0];
			} else {
				this._selectedTab = tabs[0];
				this._selectedTab._selected = true;
			}

			this._itemNavigation.setCurrentItem(this._selectedTab)
		}

		// Set external properties to items
		this.items.filter(item => !item.isSeparator).forEach((item, index, arr) => {
			item._isInline = this.tabLayout === TabLayout.Inline;
			item._mixedMode = this.mixedMode;
			item._posinset = index + 1;
			item._setsize = arr.length;
			item._getTabContainerHeaderItemCallback = _ => {
				return this.getDomRef().querySelector(`#${item._id}`);
			};
			item._itemSelectCallback = this._onItemSelect.bind(this);
			item._getRealDomRef = () => this.getDomRef().querySelector(`*[data-ui5-stable=${item.stableDomRef}]`);
		});

		if (!this._animationRunning) {
			this._contentCollapsed = this.collapsed;
		}
	}

	onAfterRendering() {
		this.items.forEach(item => {
			item._getTabInStripDomRef = this.getDomRef().querySelector(`*[data-ui5-stable="${item.stableDomRef}"]`);
		});
	}

	onEnterDOM() {
		ResizeHandler.register(this._getHeader(), this._handleResize);
	}

	onExitDOM() {
		ResizeHandler.deregister(this._getHeader(), this._handleResize);
	}

	_onHeaderClick(event) {
		const tab = getTab(event.target);
		if (!tab) {
			return;
		}

		this._onHeaderItemSelect(tab);
	}

	_onHeaderKeyDown(event) {
		const tab = getTab(event.target);
		if (!tab) {
			return;
		}

		if (isEnter(event)) {
			this._onHeaderItemSelect(tab);
		}

		// Prevent Scrolling
		if (isSpace(event)) {
			event.preventDefault();
		}
	}

	_onHeaderKeyUp(event) {
		const tab = getTab(event.target);
		if (!tab) {
			return;
		}

		if (isSpace(event)) {
			this._onHeaderItemSelect(tab);
		}
	}

	_onHeaderItemSelect(tab) {
		if (!tab.hasAttribute("disabled")) {
			this._onItemSelect(tab);

			if (this.tabsOverflowMode !== TabsOverflowMode.StartAndEnd) {
				this._setItemsForStrip();
			}
		}
	}

	_onOverflowListItemSelect(event) {
		this._onItemSelect(event.detail.item);
		this.responsivePopover.close();
		this._setItemsForStrip();
		this.shadowRoot.querySelector(`#${event.detail.item.id}`).focus();
	}

	_onItemSelect(target) {
		const selectedIndex = findIndex(this.items, item => item._id === target.id);
		const selectedTabIndex = findIndex(this._getTabs(), item => item._id === target.id);
		const selectedTab = this.items[selectedIndex];

		// update selected items
		this.items.forEach((item, index) => {
			if (!item.isSeparator) {
				const selected = selectedIndex === index;
				item.selected = selected;

				if(item._selected) {
					item._selected = false;
				}

				if (selected) {
					this._itemNavigation.setCurrentItem(item);
				}
			}
		}, this);

		if (this.fixed) {
			this.selectTab(selectedTab, selectedTabIndex);
			return;
		}

		if (!this.animate) {
			this.toggle(selectedTab);
			this.selectTab(selectedTab, selectedTabIndex);
			return;
		}

		this.toggleAnimated(selectedTab);
		this.selectTab(selectedTab, selectedTabIndex);
	}

	async toggleAnimated(selectedTab) {
		const content = this.shadowRoot.querySelector(".ui5-tc__content");
		let animationPromise = null;

		this._animationRunning = true;

		if (selectedTab === this._selectedTab) {
			// click on already selected tab - animate both directions
			this.collapsed = !this.collapsed;
			animationPromise = this.collapsed ? this.slideContentUp(content) : this.slideContentDown(content);
		} else {
			// click on new tab - animate if the content is currently collapsed
			animationPromise = this.collapsed ? this.slideContentDown(content) : Promise.resolve();
			this.collapsed = false;
		}

		await animationPromise;
		this._contentCollapsed = this.collapsed;
		this._animationRunning = false;
	}

	toggle(selectedTab) {
		if (selectedTab === this._selectedTab) {
			this.collapsed = !this.collapsed;
		} else {
			this.collapsed = false;
		}
	}

	selectTab(selectedTab, selectedTabIndex) {
		// select the tab
		this._selectedTab = selectedTab;
		this.fireEvent("tab-select", {
			tab: selectedTab,
			tabIndex: selectedTabIndex,
		});
	}

	slideContentDown(element) {
		return slideDown({ element }).promise();
	}

	slideContentUp(element) {
		return slideUp({ element }).promise();
	}

	async _onOverflowButtonClick(event) {
		let button;
		const isEndOverflow = event.currentTarget.classList.contains("ui5-tc__endOverflowButton");
		const isStartOverflow = event.currentTarget.classList.contains("ui5-tc__startOverflowButton");

		if (!event.currentTarget.classList.contains("ui5-tc__overflowButton")) {
			return;
		}

		if (isEndOverflow) {
			button = this.overflowButton[0] || this.getDomRef().querySelector(".ui5-tc__endOverflowButton > [ui5-button]");
			this.items.forEach(item => {
				item.isInEndOverflow = true;
			});
		} else if (isStartOverflow) {
			button = this.startOverflowButton[0] || this.getDomRef().querySelector(".ui5-tc__startOverflowButton > [ui5-button]");
			this.items.forEach(item => {
				item.isInEndOverflow = false;
			});
		}

		this.responsivePopover = await this._respPopover();
		if (this.responsivePopover.opened) {
			this.responsivePopover.close();
		} else {
			this.responsivePopover.showAt(button);
		}
	}

	_handleResize() {
		this._updateMediaRange();
		this._setItemsForStrip();
	}

	_setItemsForStrip() {
		const tabsInStripContainer = this._getTabsInStripContainer();
		let allItemsWidth = 0;

		if (!this._selectedTab) {
			return;
		}

		const itemsDomRefs = this.items.map(item => item.getTabInStripDomRef());

		// make sure the overflow buttons are hidden
		this._getHeaderStartOverflowButton().setAttribute("hidden", "");
		this._getHeaderEndOverflowButton().setAttribute("hidden", "");

		// show all tabs
		for (let i = 0; i < itemsDomRefs.length; i++) {
			itemsDomRefs[i].removeAttribute("hidden");
			itemsDomRefs[i].removeAttribute("start-overflow");
			itemsDomRefs[i].removeAttribute("end-overflow");
		}

		itemsDomRefs.forEach(item => {
			allItemsWidth += this._getItemWidth(item);
		});

		const hasOverflow = tabsInStripContainer.offsetWidth < allItemsWidth;

		if (!hasOverflow) {
			this._closeRespPopover();
			return;
		}

		switch (this.tabsOverflowMode) {
		case TabsOverflowMode.StartAndEnd:
			this._updateStartAndEndOverflow(itemsDomRefs);
			break;
		case TabsOverflowMode.End:
			this._updateEndOverflow(itemsDomRefs);
			break;
		}

		this._updateOverflowItems();
		this._itemNavigation._init();
		this._itemNavigation.setCurrentItem(this._selectedTab);
	}

	_updateEndOverflow(itemsDomRefs) {
		// show end overflow button
		this._getHeaderEndOverflowButton().removeAttribute("hidden");

		const selectedTabDomRef = this._selectedTab.getTabInStripDomRef();
		const containerWidth = this._getTabsInStripContainer().offsetWidth;

		const selectedItemIndexAndWidth = this._getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef);
		const lastVisibleTabIndex = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);

		for (let i = lastVisibleTabIndex + 1; i < itemsDomRefs.length; i++) {
			itemsDomRefs[i].setAttribute("hidden", "");
			itemsDomRefs[i].setAttribute("end-overflow", "");
		}
	}

	_updateStartAndEndOverflow(itemsDomRefs) {
		let containerWidth = this._getTabsInStripContainer().offsetWidth;
		const selectedTabDomRef = this._selectedTab.getTabInStripDomRef();
		const selectedItemIndexAndWidth = this._getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef);
		const hasStartOverflow = this._hasStartOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
		const hasEndOverflow = this._hasEndOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth);
		let firstVisible;
		let lastVisible;

		// has "end", but no "start" overflow
		if (!hasStartOverflow) {
			// show "end" overflow button
			this._getHeaderEndOverflowButton().removeAttribute("hidden");
			// width is changed
			containerWidth = this._getTabsInStripContainer().offsetWidth;

			lastVisible = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);

			for (let i = lastVisible + 1; i < itemsDomRefs.length; i++) {
				itemsDomRefs[i].setAttribute("hidden", "");
				itemsDomRefs[i].setAttribute("end-overflow", "");
			}

			return;
		}

		// has "start", but no "end" overflow
		if (!hasEndOverflow) {
			// show "start" overflow button
			this._getHeaderStartOverflowButton().removeAttribute("hidden");
			// width is changed
			containerWidth = this._getTabsInStripContainer().offsetWidth;

			firstVisible = this._findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width);

			for (let i = firstVisible - 1; i >= 0; i--) {
				itemsDomRefs[i].setAttribute("hidden", "");
				itemsDomRefs[i].setAttribute("start-overflow", "");
			}

			return;
		}

		// show "start" overflow button
		this._getHeaderStartOverflowButton().removeAttribute("hidden");
		// show "end" overflow button
		this._getHeaderEndOverflowButton().removeAttribute("hidden");
		// width is changed
		containerWidth = this._getTabsInStripContainer().offsetWidth;

		firstVisible = this._findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width, selectedItemIndexAndWidth.index - 1);
		lastVisible = this._findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemIndexAndWidth.width, firstVisible);

		for (let i = firstVisible - 1; i >= 0; i--) {
			itemsDomRefs[i].setAttribute("hidden", "");
			itemsDomRefs[i].setAttribute("start-overflow", "");
		}

		for (let i = lastVisible + 1; i < itemsDomRefs.length; i++) {
			itemsDomRefs[i].setAttribute("hidden", "");
			itemsDomRefs[i].setAttribute("end-overflow", "");
		}
	}

	_hasStartOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth) {
		if (selectedItemIndexAndWidth.index === 0) {
			return false;
		}

		let leftItemsWidth = 0;

		for (let i = selectedItemIndexAndWidth.index - 1; i >= 0; i--) {
			leftItemsWidth += this._getItemWidth(itemsDomRefs[i]);
		}

		let hasStartOverflow = containerWidth < leftItemsWidth + selectedItemIndexAndWidth.width;

		// if there is no "start" overflow, it has "end" overflow
		// check it again with the "end" overflow
		if (!hasStartOverflow) {
			this._getHeaderEndOverflowButton().removeAttribute("hidden");
			containerWidth = this._getTabsInStripContainer().offsetWidth;
			hasStartOverflow = containerWidth < leftItemsWidth + selectedItemIndexAndWidth.width;
			this._getHeaderEndOverflowButton().setAttribute("hidden", "");
		}

		return hasStartOverflow;
	}

	_hasEndOverflow(containerWidth, itemsDomRefs, selectedItemIndexAndWidth) {
		if (selectedItemIndexAndWidth.index >= itemsDomRefs.length) {
			return false;
		}

		let rightItemsWidth = 0;

		for (let i = selectedItemIndexAndWidth.index; i < itemsDomRefs.length; i++) {
			rightItemsWidth += this._getItemWidth(itemsDomRefs[i]);
		}

		let hasEndOverflow = containerWidth < rightItemsWidth + selectedItemIndexAndWidth.width;

		// if there is no "end" overflow, it has "start" overflow
		// check it again with the "start" overflow
		if (!hasEndOverflow) {
			this._getHeaderStartOverflowButton().removeAttribute("hidden");
			containerWidth = this._getTabsInStripContainer().offsetWidth;
			hasEndOverflow = containerWidth < rightItemsWidth + selectedItemIndexAndWidth.width;
			this._getHeaderStartOverflowButton().setAttribute("hidden", "");
		}

		return hasEndOverflow;
	}

	_getItemWidth(itemDomRef) {
		const styles = window.getComputedStyle(itemDomRef);
		const margins = Number.parseInt(styles.marginLeft) + Number.parseInt(styles.marginRight);

		return itemDomRef.offsetWidth + margins;
	}

	_getSelectedItemIndexAndWidth(itemsDomRefs, selectedTabDomRef) {
		let index = itemsDomRefs.indexOf(selectedTabDomRef);
		let width = selectedTabDomRef.offsetWidth;
		let selectedSeparator;

		if (itemsDomRefs[index - 1] && itemsDomRefs[index - 1].classList.contains("ui5-tc__separator")) {
			selectedSeparator = itemsDomRefs[index - 1];
			width += this._getItemWidth(selectedSeparator);
		}

		itemsDomRefs.splice(index, 1);

		// if previous item is a separator - remove it
		if (selectedSeparator) {
			itemsDomRefs.splice(index - 1, 1);
			index--;
		}

		return {
			index,
			width,
		};
	}

	_findFirstVisibleItem(itemsDomRefs, containerWidth, selectedItemWidth, startIndex) {
		if (startIndex === undefined) {
			startIndex = itemsDomRefs.length - 1;
		}

		let lastVisible = startIndex + 1;

		for (let index = startIndex; index >= 0; index--) {
			const itemWidth = this._getItemWidth(itemsDomRefs[index]);

			if (containerWidth < selectedItemWidth + itemWidth) {
				break;
			}

			selectedItemWidth += itemWidth;
			lastVisible = index;
		}

		return lastVisible;
	}

	_findLastVisibleItem(itemsDomRefs, containerWidth, selectedItemWidth, startIndex) {
		startIndex = startIndex || 0;

		let lastVisibleIndex = startIndex - 1;
		let index = startIndex;

		for (; index < itemsDomRefs.length; index++) {
			const itemWidth = this._getItemWidth(itemsDomRefs[index]);

			if (containerWidth < selectedItemWidth + itemWidth) {
				break;
			}

			selectedItemWidth += itemWidth;
			lastVisibleIndex = index;
		}

		// if prev item is separator - hide it
		const prevItem = itemsDomRefs[index - 1];
		if (prevItem && prevItem.classList.contains("ui5-tc__separator")) {
			lastVisibleIndex -= 1;
		}

		return lastVisibleIndex;
	}

	_updateOverflowItems() {
		const isStartAndEndOverflow = this.tabsOverflowMode === TabsOverflowMode.StartAndEnd;
		let startOverflowItemsCount = 0;
		let endOverflowItemsCount = 0;

		this.items.forEach(item => {
			item.hideInStartOverflow = !item.getTabInStripDomRef().hasAttribute("start-overflow");
			item.hideInEndOverflow = !item.getTabInStripDomRef().hasAttribute("end-overflow");

			if (isStartAndEndOverflow) {
				if (!item.hideInStartOverflow && !item.isSeparator) {
					startOverflowItemsCount++;
				} else if (!item.hideInEndOverflow && !item.isSeparator) {
					endOverflowItemsCount++;
				}
			}
		});

		if (isStartAndEndOverflow) {
			this._startOverflowText = `+${startOverflowItemsCount}`;
			this._endOverflowText = `+${endOverflowItemsCount}`;
		} else {
			this._endOverflowText = this.overflowButtonText;
		}
	}

	async _closeRespPopover() {
		this.responsivePopover = await this._respPopover();
		this.responsivePopover.close();
	}

	/**
	 * Obtains the tabs for navigation via keyboard
	 * @private
	 */
	_getFocusableTabs() {
		const focusableTabs = [];

		this._getTabs().forEach(tab => {
			if (tab.getTabInStripDomRef() && !tab.getTabInStripDomRef().hasAttribute("hidden")) {
				focusableTabs.push(tab);
			}
		});

		return focusableTabs;
	}

	_updateMediaRange() {
		this.mediaRange = MediaRange.getCurrentRange(MediaRange.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
	}

	_getHeader() {
		return this.shadowRoot.querySelector(`#${this._id}-header`);
	}

	_getTabs() {
		return this.items.filter(item => !item.isSeparator);
	}

	_getTabsInStripContainer() {
		return this.shadowRoot.querySelector(`#${this._id}-tabsInStripContainer`);
	}

	_getHeaderStartOverflowButton() {
		return this.shadowRoot.querySelector(".ui5-tc__startOverflowButton");
	}

	_getHeaderEndOverflowButton() {
		return this.shadowRoot.querySelector(".ui5-tc__endOverflowButton");
	}

	async _respPopover() {
		const staticAreaItem = await this.getStaticAreaItemDomRef();
		return staticAreaItem.querySelector(`#${this._id}-overflowMenu`);
	}

	get classes() {
		return {
			root: {
				"ui5-tc-root": true,
				"ui5-tc--textOnly": this.textOnly,
				"ui5-tc--withAdditonalText": this.withAdditonalText,
				"ui5-tc--standardTabLayout": this.standardTabLayout,
			},
			header: {
				"ui5-tc__header": true,
			},
			headerInnerContainer: {
				"ui5-tc__headerInnerContainer": true,
			},
			tabsInStripContainer: {
				"ui5-tc__tabsInStripContainer": true,
			},
			headerList: {
				"ui5-tc__headerList": true,
			},
			separator: {
				"ui5-tc__separator": true,
			},
			content: {
				"ui5-tc__content": true,
				"ui5-tc__content--collapsed": this._contentCollapsed,
			},
		};
	}

	get mixedMode() {
		return this.items.some(item => item.icon) && this.items.some(item => item.text);
	}

	get textOnly() {
		return this.items.every(item => !item.icon);
	}

	get withAdditonalText() {
		return this.items.some(item => !!item.additionalText);
	}

	get standardTabLayout() {
		return this.tabLayout === TabLayout.Standard;
	}

	get previousIconACCName() {
		return TabContainer.i18nBundle.getText(TABCONTAINER_PREVIOUS_ICON_ACC_NAME);
	}

	get nextIconACCName() {
		return TabContainer.i18nBundle.getText(TABCONTAINER_NEXT_ICON_ACC_NAME);
	}

	get overflowMenuTitle() {
		return TabContainer.i18nBundle.getText(TABCONTAINER_OVERFLOW_MENU_TITLE);
	}

	get tabsAtTheBottom() {
		return this.tabsPlacement === TabContainerTabsPlacement.Bottom;
	}

	get overflowMenuIcon() {
		return this.tabsAtTheBottom ? "slim-arrow-up" : "slim-arrow-down";
	}

	get overflowButtonText() {
		return TabContainer.i18nBundle.getText(TABCONTAINER_END_OVERFLOW);
	}

	get animate() {
		return getAnimationMode() !== AnimationMode.None;
	}

	static get dependencies() {
		return [
			Button,
			Icon,
			List,
			ResponsivePopover,
		];
	}

	static async onDefine() {
		TabContainer.i18nBundle = await getI18nBundle("@ui5/webcomponents");
	}
}

const isTabLi = el => el.localName === "li" && el.getAttribute("role") === "tab";

const getTab = el => {
	while (el) {
		if (isTabLi(el)) {
			return el;
		}

		el = el.parentElement;
	}

	return false;
};

const findIndex = (arr, predicate) => {
	for (let i = 0; i < arr.length; i++) {
		const result = predicate(arr[i]);

		if (result) {
			return i;
		}
	}

	return -1;
};

TabContainer.define();

export default TabContainer;
