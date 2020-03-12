import FlexTestUtils from './src/FlexTestUtils';
import Target from './src/Target';

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {
  describe('update', function() {
    this.timeout(0);

    let root: any;

    const getRoot = () => root;
    const addUpdateTest = (name: string, setup: any) => {
      flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup);
    };

    describe('deferred/smart updates', () => {
      let subject: any;
      let sibling: any;
      before(() => {
        const structure = {
          w: 500,
          h: 500,
          flex: { enabled: true, direction: 'column', padding: 5 },
          r: [0, 0, 510, 510],
          children: [
            {
              w: 0,
              h: 50,
              flex: { enabled: true },
              flexItem: { grow: 1 },
              sibling: true,
              r: [5, 5, 500, 166.67],
            },
            {
              w: 100,
              h: 100,
              flex: { enabled: true, direction: 'column' },
              subject: true,
              flexItem: { grow: 2 },
              r: [5, 171.67, 100, 333.33],
              children: [{ w: 90, h: 100, flexItem: { grow: 1 }, sub: true, r: [0, 0, 90, 333.33] }],
            },
          ],
        };
        root = flexTestUtils.buildFlexFromStructure(structure);
        root.update();

        sibling = root.children[0];
        subject = root.children[1];
      });

      describe('initial', () => {
        it('layouts', () => {
          return flexTestUtils.validateAnnotatedFlex(root);
        });
      });

      addUpdateTest('no changes', () => {
        return { layouts: [] };
      });

      addUpdateTest('update from within fixed-size container', () => {
        subject.children[0].w = 100;
        subject.children[0].r[2] = 100;
        return { layouts: [subject] };
      });

      addUpdateTest('change dims of fixed-size container', () => {
        subject.h = 130;
        subject.r[1] = 161.67;
        subject.r[3] = 343.33;
        sibling.r[3] = 156.67;
        subject.children[0].r[3] = 343.33;
        return { layouts: [root, sibling, sibling, subject] };
      });

      addUpdateTest('change from root', () => {
        root.w = 600;
        root.r[2] = 610;
        sibling.r[2] = 600;
        return { layouts: [root, sibling] };
      });

      addUpdateTest('change to dynamic width', () => {
        subject.w = 0;
        subject.r[2] = 600;
        return { layouts: [root, subject, subject] };
      });

      addUpdateTest('change from root', () => {
        root.w = 700;
        root.r[2] = 710;
        sibling.r[2] = 700;
        subject.r[2] = 700;
        return { layouts: [root, sibling, subject] };
      });

      addUpdateTest('change offset of root', () => {
        root.x = 200;
        root.r[0] = 200;
        return { layouts: [] };
      });

      addUpdateTest('change offset of subject', () => {
        subject.x = 2;
        subject.y = 2;
        subject.r[0] += 2;
        subject.r[1] += 2;
        return { layouts: [] };
      });
    });

    describe('mutations', () => {
      before(() => {
        const structure = {
          children: [
            {
              w: 550,
              h: 500,
              flex: { enabled: true, paddingTop: 5, paddingLeft: 7 },
              r: [0, 0, 557, 505],
              children: [
                {
                  flex: { enabled: true, padding: 100, alignItems: 'flex-start' },
                  w: 500,
                  r: [7, 5, 700, 500],
                  children: [
                    {
                      flex: { enabled: true, direction: 'column-reverse', paddingLeft: 50 },
                      h: 400,
                      w: 200,
                      r: [100, 100, 150, 400],
                      children: [
                        { w: 100, h: 100, r: [50, 300, 100, 100] },
                        { w: 100, h: 100, r: [50, 200, 100, 100], flexItem: {} },
                        { w: 100, h: 100, r: [50, 0, 100, 200], flexItem: { grow: 1 } },
                      ],
                    },
                    {
                      flex: { enabled: true, padding: 10 },
                      r: [250, 100, 120, 220],
                      children: [{ w: 100, h: 200, flexItem: {}, r: [10, 10, 100, 200] }],
                    },
                    {
                      w: 300,
                      h: 300,
                      r: [370, 100, 300, 300],
                      children: [
                        {
                          flex: { enabled: true, padding: 10 },
                          w: 100,
                          r: [0, 0, 120, 120],
                          children: [{ w: 100, h: 100, r: [10, 10, 100, 100] }],
                        },
                      ],
                    },
                  ],
                },
                {
                  w: 0,
                  h: 400,
                  flex: { enabled: true },
                  r: [707, 5, 0, 400],
                  children: [{ r: [0, 0, 0, 400] }],
                },
              ],
            },
          ],
        };
        root = flexTestUtils.buildFlexFromStructure(structure);
        root.update();
      });

      describe('initial', () => {
        it('layouts', () => {
          return flexTestUtils.validateAnnotatedFlex(root);
        });
      });

      addUpdateTest('update tree root dimensions', () => {
        root.children[0].w = 1800;
        root.children[0].r[2] = 1807;
      });

      addUpdateTest('disable shrinking', () => {
        root.children[0].children[0].children[0].flexItem.shrink = 0;
        root.children[0].children[0].children[0].r[2] = 250;
        root.children[0].children[0].children[1].r[0] = 350;
        root.children[0].children[0].children[2].r[0] = 470;
      });

      addUpdateTest('update sub grow', () => {
        root.children[0].children[0].flexItem.grow = 2;
        root.children[0].children[0].r[2] = 1800;
        root.children[0].children[1].r[0] = 1807;
      });

      addUpdateTest('update main width (shrink)', () => {
        root.children[0].w = 300;
        root.children[0].r[2] = 307;
        root.children[0].children[0].r[2] = 700;
        root.children[0].children[1].r[0] = 707;
      });

      addUpdateTest('update main y offset (1)', () => {
        root.children[0].y = 50;
        root.children[0].r[1] = 50;
      });

      addUpdateTest('update main y offset (2)', () => {
        root.children[0].y = 0;
        root.children[0].r[1] = 0;
      });

      addUpdateTest('update sub y offset (1)', () => {
        root.children[0].children[0].y = 50;
        root.children[0].children[0].r[1] = 55;
      });

      addUpdateTest('update sub y offset (2)', () => {
        root.children[0].children[0].y = 0;
        root.children[0].children[0].r[1] = 5;
      });

      addUpdateTest('update padding', () => {
        root.children[0].children[0].flex.padding = 10;
        root.children[0].children[0].r[2] = 520;
        root.children[0].children[0].r[0] = 7;
        root.children[0].children[0].children[0].r[0] = 10;
        root.children[0].children[0].children[0].r[1] = 10;
        root.children[0].children[0].children[1].r[0] = 260;
        root.children[0].children[0].children[1].r[1] = 10;
        root.children[0].children[0].children[2].r[0] = 380;
        root.children[0].children[0].children[2].r[1] = 10;
        root.children[0].children[1].r[0] = 527;
      });

      addUpdateTest('align items', () => {
        root.children[0].children[0].flex.alignItems = 'stretch';
        root.children[0].children[0].children[1].r[3] = 480;
      });

      addUpdateTest('align self', () => {
        root.children[0].children[0].children[1].flexItem.alignSelf = 'flex-start';
        root.children[0].children[0].children[1].r[3] = 220;
      });

      addUpdateTest('update deep tree', () => {
        root.children[0].children[0].children[2].children[0].w = 200;
        root.children[0].children[0].children[2].children[0].r[2] = 220;
      });

      addUpdateTest('disable flex item', () => {
        root.children[0].children[0].children[0].children[1].flexItem.enabled = false;
        root.children[0].children[0].children[0].children[1].r[0] = 0;
        root.children[0].children[0].children[0].children[1].r[1] = 0;
        root.children[0].children[0].children[0].children[2].r[3] = 300;
      });

      addUpdateTest('re-enable flex item', () => {
        root.children[0].children[0].children[0].children[1].flexItem.enabled = true;
        root.children[0].children[0].children[0].children[1].r[0] = 50;
        root.children[0].children[0].children[0].children[1].r[1] = 200;
        root.children[0].children[0].children[0].children[2].r[3] = 200;
      });

      addUpdateTest('disable flex container', () => {
        root.children[0].children[0].children[0].flex.enabled = false;
        root.children[0].children[0].children[0].r[2] = 200;
        root.children[0].children[0].children[0].children[0].r[0] = 0;
        root.children[0].children[0].children[0].children[0].r[1] = 0;
        root.children[0].children[0].children[0].children[1].r[0] = 0;
        root.children[0].children[0].children[0].children[1].r[1] = 0;
        root.children[0].children[0].children[0].children[2].r[0] = 0;
        root.children[0].children[0].children[0].children[2].r[3] = 100;
        root.children[0].children[0].children[1].r[0] = 210;
        root.children[0].children[0].children[2].r[0] = 330;
      });

      addUpdateTest('enable flex container', () => {
        root.children[0].children[0].children[0].flex.enabled = true;
        root.children[0].children[0].children[0].r[2] = 250;
        root.children[0].children[0].children[0].children[0].r[0] = 50;
        root.children[0].children[0].children[0].children[0].r[1] = 300;
        root.children[0].children[0].children[0].children[1].r[0] = 50;
        root.children[0].children[0].children[0].children[1].r[1] = 200;
        root.children[0].children[0].children[0].children[2].r[0] = 50;
        root.children[0].children[0].children[0].children[2].r[3] = 200;
        root.children[0].children[0].children[1].r[0] = 260;
        root.children[0].children[0].children[2].r[0] = 380;
      });

      addUpdateTest('add subtree', () => {
        const structure = {
          flex: { enabled: true },
          w: 800,
          flexItem: {},
          children: [
            { w: 200, h: 300 },
            { w: 100, h: 100 },
            { w: 150, h: 150 },
          ],
        };

        const newSubtree = new Target();
        Target.patch(newSubtree, structure);

        const target = root.children[0].children[0];
        target.addChild(newSubtree);

        root.children[0].children[0].children[3].r = [680, 10, 450, 480];
        root.children[0].children[0].children[3].children[0].r = [0, 0, 200, 300];
        root.children[0].children[0].children[3].children[1].r = [200, 0, 100, 100];
        root.children[0].children[0].children[3].children[2].r = [300, 0, 150, 150];
      });

      addUpdateTest('remove subtree', () => {
        const target = root.children[0].children[0];
        target.removeChildAt(target.children.length - 1);
      });

      addUpdateTest('visibility off', () => {
        const target = root.children[0].children[0].children[0];
        target.visible = false;

        root.children[0].children[0].r[2] = 440;
        root.children[0].children[0].children[1].r[0] = 10;
        root.children[0].children[0].children[2].r[0] = 130;
        root.children[0].children[1].r[0] = 447;
      });

      addUpdateTest('visibility on', () => {
        const target = root.children[0].children[0].children[0];
        target.visible = true;

        root.children[0].children[0].r[2] = 520;
        root.children[0].children[0].children[1].r[0] = 260;
        root.children[0].children[0].children[2].r[0] = 380;
        root.children[0].children[1].r[0] = 527;
      });
    });
  });
});
