import { FlexTestUtils } from "./src/FlexTestUtils";
import { Target } from "./src/Target";

const flexTestUtils = new FlexTestUtils();

describe("tunnel", () => {
    describe("flex", () => {
        // flexItem: false should cause the item to be ignored.
        flexTestUtils.addMochaTestForAnnotatedStructure("simple", {
            flex: { enabled: true },
            r: [0, 0, 770, 315],
            flexItem: {},
            children: [
                {
                    skipInLayout: true,
                    w: (w: number) => w,
                    h: (h: number) => h,
                    r: [0, 0, 770, 315],
                    children: [
                        {
                            w: 200,
                            h: 300,
                            flexItem: { marginLeft: 100, marginRight: 70, marginTop: 5, marginBottom: 10 },
                            r: [100, 5, 200, 300],
                        },
                        { w: 100, h: 100, flexItem: { margin: 50 }, r: [420, 50, 100, 100] },
                        { w: 150, h: 150, flexItem: { marginRight: 50 }, r: [570, 0, 150, 150] },
                    ],
                },
                { flexItem: { enabled: false }, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
            ],
        });
    });

    describe("multiple levels", () => {
        flexTestUtils.addMochaTestForAnnotatedStructure("simple", {
            flex: { enabled: true },
            r: [0, 0, 770, 315],
            flexItem: {},
            children: [
                {
                    skipInLayout: true,
                    w: (w: number) => w,
                    h: (h: number) => h,
                    r: [0, 0, 770, 315],
                    children: [
                        {
                            skipInLayout: true,
                            w: (w: number) => w,
                            h: (h: number) => h,
                            r: [0, 0, 770, 315],
                            children: [
                                {
                                    w: 200,
                                    h: 300,
                                    flexItem: {
                                        marginLeft: 100,
                                        marginRight: 70,
                                        marginTop: 5,
                                        marginBottom: 10,
                                    },
                                    r: [100, 5, 200, 300],
                                },
                                { w: 100, h: 100, flexItem: { margin: 50 }, r: [420, 50, 100, 100] },
                                { w: 150, h: 150, flexItem: { marginRight: 50 }, r: [570, 0, 150, 150] },
                            ],
                        },
                    ],
                },
                { flexItem: { enabled: false }, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
            ],
        });
    });

    describe("updates", function () {
        this.timeout(0);

        let root: any;

        const getRoot = () => root;
        const addUpdateTest = (name: string, setup: any) => {
            flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup);
        };

        let subject: Target;
        let nested: Target;
        let deepChildItems: Target[] = [];
        let abs: Target;
        before(() => {
            const structure = {
                flex: { enabled: true },
                r: [0, 0, 770, 315],
                flexItem: {},
                children: [
                    {
                        skipInLayout: true,
                        w: (w: number) => w,
                        h: (h: number) => h,
                        r: [0, 0, 770, 315],
                        children: [
                            {
                                skipInLayout: true,
                                w: (w: number) => w,
                                h: (h: number) => h,
                                r: [0, 0, 770, 315],
                                children: [
                                    {
                                        w: 200,
                                        h: 300,
                                        flexItem: {
                                            marginLeft: 100,
                                            marginRight: 70,
                                            marginTop: 5,
                                            marginBottom: 10,
                                        },
                                        r: [100, 5, 200, 300],
                                    },
                                    { w: 100, h: 100, flexItem: { margin: 50 }, r: [420, 50, 100, 100] },
                                    { w: 150, h: 150, flexItem: { marginRight: 50 }, r: [570, 0, 150, 150] },
                                ],
                            },
                        ],
                    },
                    { flexItem: { enabled: false }, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
                ],
            };
            root = flexTestUtils.buildFlexFromStructure(structure);
            root.update();

            subject = root.children[0];
            nested = root.children[0].children[0];
            deepChildItems = root.children[0].children[0].children;
            abs = root.children[1];
        });

        describe("initial", () => {
            it("layouts", () => {
                return flexTestUtils.validateAnnotatedFlex(root);
            });
        });

        addUpdateTest("no changes", () => {
            return { layouts: [] };
        });

        addUpdateTest("update deep child", () => {
            deepChildItems[0].w = 100;

            root.r[2] = 670;
            subject.r[2] = 670;
            nested.r[2] = 670;
            abs.r[2] = 670;
            deepChildItems[0].r = [100, 5, 100, 300];
            deepChildItems[1].r = [320, 50, 100, 100];
            deepChildItems[2].r = [470, 0, 150, 150];
            return { layouts: [root] };
        });

        addUpdateTest("set fixed width and grow", () => {
            root.w = 1000;
            deepChildItems[0].flexItem.grow = 1;

            root.r[2] = 1000;
            subject.r[2] = 1000;
            nested.r[2] = 1000;
            abs.r[2] = 1000;
            deepChildItems[0].r = [100, 5, 430, 300];
            deepChildItems[1].r = [650, 50, 100, 100];
            deepChildItems[2].r = [800, 0, 150, 150];
            return { layouts: [root] };
        });

        addUpdateTest("set padding on flex", () => {
            root.flex.padding = 100;
            root.r = [0, 0, 1200, 515];
            subject.r = [0, 0, 1200, 515];
            nested.r = [0, 0, 1200, 515];
            abs.r = [0, 0, 1200, 515];
            deepChildItems[0].flexItem.grow = 1;

            deepChildItems[0].r = [200, 105, 430, 300];
            deepChildItems[1].r = [750, 150, 100, 100];
            deepChildItems[2].r = [900, 100, 150, 150];
            return { layouts: [root] };
        });

        addUpdateTest("disable tunnel", () => {
            subject.skipInLayout = false;

            root.r = [0, 0, 1200, 200];
            subject.r = [100, 100, 1200, 0];
            nested.r = [0, 0, 1200, 0];
            abs.r = [0, 0, 1200, 200];
            deepChildItems[0].r = [0, 0, 100, 300];
            deepChildItems[1].r = [0, 0, 100, 100];
            deepChildItems[2].r = [0, 0, 150, 150];
            return { layouts: [root] };
        });

        addUpdateTest("disable tunnel, enable flex", () => {
            nested.skipInLayout = false;
            nested.flex.enabled = true;

            nested.r = [0, 0, 1200, 0];
            deepChildItems[0].r = [100, 5, 630, 300];
            deepChildItems[1].r = [850, 50, 100, 100];
            deepChildItems[2].r = [1000, 0, 150, 150];
            return { layouts: [nested] };
        });
    });

    describe("skipInLayout until and including root", () => {
        let root: any;

        const getRoot = () => root;
        const addUpdateTest = (name: string, setup: any) => {
            flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup);
        };

        let subject: Target;
        let children: Target[];

        before(() => {
            const structure = {
                r: [0, 0, 1000, 1000],
                w: 1000,
                h: 1000,
                skipInLayout: true,
                flex: {
                    enabled: true,
                },
                children: [
                    {
                        skipInLayout: true,
                        r: [0, 0, 0, 0],
                        children: [
                            { w: 100, h: 100, r: [0, 0, 100, 100] },
                            { w: 100, h: 100, r: [0, 0, 100, 100] },
                            { w: 100, h: 100, r: [0, 0, 100, 100] },
                        ],
                    },
                ],
            };

            root = flexTestUtils.buildFlexFromStructure(structure);
            root.update();

            subject = root.children[0];
            children = subject.children;
        });

        describe("initial", () => {
            it("layouts", () => {
                return flexTestUtils.validateAnnotatedFlex(root);
            });
        });

        addUpdateTest("no changes", () => {
            return { layouts: [] };
        });

        addUpdateTest("set flex container in skipped", () => {
            subject.flex.enabled = true;
            return { layouts: [] };
        });

        addUpdateTest("disable skipping", () => {
            subject.skipInLayout = false;
            children[1].r[0] = 100;
            children[2].r[0] = 200;
            subject.r = [0, 0, 300, 100];
            return { layouts: [subject] };
        });

        addUpdateTest("enable skipping", () => {
            subject.skipInLayout = true;
            children[1].r[0] = 0;
            children[2].r[0] = 0;
            subject.r = [0, 0, 0, 0];
            return { layouts: [] };
        });
    });

    describe("add new flex item", () => {
        let root: any;

        const getRoot = () => root;
        const addUpdateTest = (name: string, setup: any) => {
            flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup);
        };

        let subject: Target;

        before(() => {
            const structure = {
                r: [0, 0, 100, 100],
                children: [
                    {
                        skipInLayout: true,
                        r: [0, 0, 0, 0],
                    },
                ],
            };

            root = flexTestUtils.buildFlexFromStructure(structure);

            subject = root.children[0];

            root.flex = true;

            const child = new Target();
            Target.patch(root, { w: 100, h: 100, r: [0, 0, 100, 100] });

            subject.addChild(child);
        });

        describe("initial", () => {
            it("layouts", () => {
                return flexTestUtils.validateAnnotatedFlex(root);
            });
        });

        addUpdateTest("no changes", () => {
            return { layouts: [] };
        });
    });

    describe("absolute", () => {
        let root: any;

        const getRoot = () => root;
        const addUpdateTest = (name: string, setup: any) => {
            flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup);
        };

        let subject: Target;
        let child: Target;
        let tunnel: Target;

        before(() => {
            const structure = {
                r: [0, 0, 1000, 1000],
                w: 1000,
                h: 1000,
                children: [
                    {
                        skipInLayout: true,
                        r: [0, 0, 0, 0],
                        children: [
                            {
                                w: (w: number) => w,
                                h: (h: number) => h,
                                r: [0, 0, 1000, 1000],
                            },
                        ],
                    },
                ],
            };

            root = flexTestUtils.buildFlexFromStructure(structure);
            root.update();

            tunnel = root.children[0];
            child = root.children[0].children[0];
        });

        describe("initial", () => {
            it("layouts", () => {
                return flexTestUtils.validateAnnotatedFlex(root);
            });
        });

        addUpdateTest("no changes", () => {
            return { layouts: [] };
        });

        addUpdateTest("disable tunnel", () => {
            tunnel.skipInLayout = false;
            child.r = [0, 0, 0, 0];
            return { layouts: [] };
        });

        addUpdateTest("enable tunnel", () => {
            tunnel.skipInLayout = true;
            child.r = [0, 0, 1000, 1000];
            return { layouts: [] };
        });
    });
});
