import FlexTestUtils from "./src/FlexTestUtils";
import Target from "./src/Target";

const flexTestUtils = new FlexTestUtils();

describe("tunnel", () => {
    describe("simple", () => {
        // flexItem: false should cause the item to be ignored.
        flexTestUtils.addMochaTestForAnnotatedStructure("simple", {
            flex: { enabled: true },
            r: [0, 0, 770, 315],
            flexItem: {},
            children: [
                {
                    layoutTunnel: true,
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
                { flexItem: false, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
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
                    layoutTunnel: true,
                    w: (w: number) => w,
                    h: (h: number) => h,
                    r: [0, 0, 770, 315],
                    children: [
                        {
                            layoutTunnel: true,
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
                { flexItem: false, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
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
        before(() => {
            const structure = {
                flex: { enabled: true },
                r: [0, 0, 770, 315],
                flexItem: {},
                children: [
                    {
                        layoutTunnel: true,
                        w: (w: number) => w,
                        h: (h: number) => h,
                        r: [0, 0, 770, 315],
                        children: [
                            {
                                layoutTunnel: true,
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
                    { flexItem: false, w: (w: number) => w, h: (h: number) => h, r: [0, 0, 770, 315] },
                ],
            };
            root = flexTestUtils.buildFlexFromStructure(structure);
            root.update();

            subject = root.children[0];
            nested = root.children[0].children[0];
            deepChildItems = root.children[0].children[0].children;
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
            deepChildItems[0].r = [100, 5, 100, 300];
            deepChildItems[1].r = [320, 50, 100, 100];
            deepChildItems[2].r = [420, 0, 150, 150];
            return { layouts: [subject] };
        });

        addUpdateTest("set fixed width and grow", () => {
            root.w = 1000;
            deepChildItems[0].flexItem.grow = 1;

            root.r[2] = 1000;
            subject.r[2] = 1000;
            nested.r[2] = 1000;
            deepChildItems[0].r = [100, 5, 330, 300];
            deepChildItems[1].r = [320, 50, 100, 100];
            deepChildItems[2].r = [420, 0, 150, 150];
            return { layouts: [subject] };
        });

        addUpdateTest("disable tunnel", () => {
            subject.layoutTunnel = false;

            root.r = [0, 0, 0, 0];
            subject.r = [0, 0, 0, 0];
            nested.r = [0, 0, 0, 0];
            deepChildItems[0].r = [0, 0, 100, 300];
            deepChildItems[1].r = [0, 0, 100, 100];
            deepChildItems[2].r = [0, 0, 150, 150];
            return { layouts: [subject] };
        });

        addUpdateTest("disable tunnel, enable flex", () => {
            nested.layoutTunnel = false;
            nested.flex = true;

            root.r = [0, 0, 0, 0];
            subject.r = [0, 0, 0, 0];
            nested.r = [0, 0, 1000, 315];
            deepChildItems[1].r = [320, 50, 100, 100];
            deepChildItems[2].r = [420, 0, 150, 150];
            return { layouts: [subject] };
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
                        layoutTunnel: true,
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
            tunnel.layoutTunnel = false;
            child.r = [0, 0, 0, 0];
            return { layouts: [] };
        });

        addUpdateTest("enable tunnel", () => {
            tunnel.layoutTunnel = true;
            child.r = [0, 0, 1000, 1000];
            return { layouts: [] };
        });
    });
});
