import FlexNode from "./FlexNode";

export type RelativeWidthFunction = (w: number) => number;
export type RelativeHeightFunction = (h: number) => number;

export default interface FlexSubject {
    getChildren(): FlexSubject[] | undefined;

    getParent(): FlexSubject | undefined;

    getLayout(): FlexNode;

    // The subject can be configured to lazy-create the flex layout object for performance reasons.
    // This function should return false if no layout object was constructed (no settings have been done at all).
    hasLayout(): boolean;

    // Set the layout results.
    setLayoutCoords(x: number, y: number): void;
    setLayoutDimensions(w: number, h: number): void;

    // Called when a new flex container layout is necessary.
    // It's up to the subject to trigger an update loop which should
    // call FlexTarget.layoutFlexTree().
    triggerLayout(): void;

    // An invisible subject doesn't take space in the flex container
    isDisplayed(): boolean;

    // The 'set' layout dimensions.
    getSourceX(): number;
    getSourceY(): number;
    getSourceW(): number;
    getSourceH(): number;

    // Relative functions for the layout dimensions.
    getSourceFuncX(): RelativeWidthFunction | undefined;
    getSourceFuncY(): RelativeHeightFunction | undefined;
    getSourceFuncW(): RelativeWidthFunction | undefined;
    getSourceFuncH(): RelativeHeightFunction | undefined;

    // Last layout results.
    // Flexbox engine will be able to use cache if the layout dimensions were not changed since last frame.
    // It is important these to not be changed externally since the last frame.
    getLayoutX(): number;
    getLayoutY(): number;
    getLayoutW(): number;
    getLayoutH(): number;
}
