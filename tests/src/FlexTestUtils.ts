import Target from "./Target";
import FlexLayouter from "../../src/layout/FlexLayouter";
import { AnnotatedStructureMismatchCollector } from "./AnnotatedStructureMismatchCollector";
import sinon = require("sinon");
import chai = require("chai");

export default class FlexTestUtils {
    _convertToFlex(structure: any) {
        const root = this.buildFlexFromStructure(structure);
        root.update();
        return root;
    }

    buildFlexFromStructure(structure: any) {
        const root = new Target();
        Target.patch(root, structure);
        return root;
    }

    addMochaTestForAnnotatedStructure(name: string, structure: any) {
        describe(name, () => {
            it("layouts", (done) => {
                const root = this._convertToFlex(structure);
                const collector = new AnnotatedStructureMismatchCollector(root);
                const mismatches = collector.getMismatches();
                if (!mismatches.length) {
                    done();
                } else {
                    done(new Error("Mismatches:\n" + mismatches.join("\n") + "\n\n" + root.toString()));
                }
            });
        });
    }

    validateAnnotatedFlex(root: any) {
        return new Promise((resolve, reject) => {
            const collector = new AnnotatedStructureMismatchCollector(root);
            const mismatches = collector.getMismatches();
            if (mismatches.length) {
                reject(new Error("Mismatches:\n" + mismatches.join("\n") + "\n\n" + root.toString()));
            } else {
                resolve();
            }
        });
    }

    checkUpdatedTargets(updatedTargets: object[], expectedTargets: object[]) {
        const updatedSet = new Set(updatedTargets);
        const expectedSet = new Set(expectedTargets);
        const missing: any[] = [...expectedSet].filter((x) => !updatedSet.has(x));
        chai.assert(
            !missing.length,
            "has missing updated targets: " + missing.map((target) => target.subject.getLocationString()),
        );
        const unexpected: any[] = [...updatedSet].filter((x) => !expectedSet.has(x));
        chai.assert(
            !unexpected.length,
            "has unexpected updated targets: " + unexpected.map((target) => target.subject.getLocationString()),
        );

        const sameLength = expectedTargets.length === updatedTargets.length;
        chai.assert(
            sameLength,
            "the number of target updates mismatches: " +
                updatedTargets.length +
                " while we expected " +
                expectedTargets.length,
        );
    }

    addAnnotatedUpdateTest(getRoot: () => Target, name: string, setup: (root: Target) => any) {
        describe(name, () => {
            it("layouts", () => {
                const root = getRoot();
                const tests = setup(root);

                let layoutSpy: any;
                if (tests && tests.layouts) {
                    layoutSpy = sinon.spy(FlexLayouter.prototype as any, "layoutMainAxis");
                }

                root.update();
                return this.validateAnnotatedFlex(root)
                    .then(() => {
                        if (tests && tests.layouts) {
                            const updatedTargets = layoutSpy.thisValues.map(
                                (flexLayout: any) => flexLayout.container.node,
                            );
                            const expectedTargets = tests.layouts.map((target: Target) => target.layout);
                            this.checkUpdatedTargets(updatedTargets, expectedTargets);
                        }
                    })
                    .finally(() => {
                        if (tests && tests.layouts) {
                            (FlexLayouter.prototype as any).layoutMainAxis.restore();
                        }
                    });
            });
        });
    }
}
