require('babel/register');
import * as app from '../redux';
import {expect} from 'chai';

describe('App', function() {
  describe('default state', function() {
    let state = app.app();
    it('should have no files in the file order', function() {
      expect(state.fileOrder).to.have.length(0);
    });

    it('should have no files in the entities', function() {
      expect(state.entities.files).to.be.empty;
    });

    it('should have no animations in the entities', function() {
      expect(state.entities.animations).to.be.empty;
    });

    it('should have no frames in the entities', function() {
      expect(state.entities.frames).to.be.empty;
    });

    it('should not have a selected file.', function() {
      expect(state.selectedFile).to.equal(null);
    });

    it('should not have a selected animation.', function() {
      expect(state.selectedAnimation).to.equal(null);
    });

    it('should not have a selected frame.', function() {
      expect(state.selectedFrame).to.equal(null);
    });

    it('should have a default canvasHeight and canvasWidth', function() {
      expect(state.canvasWidth).to.equal(300);
      expect(state.canvasHeight).to.equal(300);
    });
  });

  describe('adjusting the canvas values', function() {
    let state = app.app();
    it('should update the width.', function() {
      let widthState = app.app(state, {type: 'SET_CANVAS_WIDTH', width: 500});
      expect(widthState.canvasWidth).to.equal(500);
    });

    it('should update the height.', function() {
      let heightState = app.app(state, {type: 'SET_CANVAS_HEIGHT', height: 500});
      expect(heightState.canvasHeight).to.equal(500);
    });
  });

  describe('adding file', function() {
    let state = app.app(undefined, {type: 'ADD_FILE', fileName: 'test.png', id: 0});

    describe('selecting a file', function() {
      let secondFileAddedState = app.app(state, {type: 'ADD_FILE', fileName: 'test1.png', id: 1});
      let selectedState = app.app(secondFileAddedState, {type: 'SELECT_FILE', file: 0});
      it('should have selected the first file added.', function() {
        expect(selectedState.selectedFile).to.equal(0);
      });
    });

    it('should have added the file to the file order', function() {
      expect(state.fileOrder).to.have.length(1);
    });

    it('should have added the file to the file entities.', function() {
      expect(state.entities.files).to.have.any.keys('0');
      expect(state.entities.files['0']).to.deep.equal({id: 0, name: 'test.png'});
    });

    it('should have marked the file as selected.', function() {
      expect(state.selectedFile).to.equal(0);
    });
  });

  describe('renaming a file.', function() {
    let state = app.app(undefined, {type: 'ADD_FILE', fileName: 'test.png', id: 0});
    state = app.app(state, {type: 'RENAME_FILE', name: 'test1.png', file: 0});
    expect(state.entities.files['0'].name).to.equal('test1.png');
  });

  describe('moving files', function() {
    let state = app.app(undefined, {type: 'ADD_FILE', fileName: 'test.png', id: 0});
    state = app.app(state, {type: 'ADD_FILE', fileName: 'test1.png', id: 1});
    it('should add the second file to the end of the fileOrder.', function() {
      expect(state.fileOrder).to.deep.equal([0,1]);
    });

    it('should update the fileOrder when the second file is moved up.', function() {
      let newState = app.app(state, {type: 'MOVE_FILE_UP', id: 1});
      expect(newState.fileOrder).to.deep.equal([1,0]);
    });

    it('should update the fileOrder when the second file is moved up.', function() {
      let newState = app.app(state, {type: 'MOVE_FILE_DOWN', id: 0});
      expect(newState.fileOrder).to.deep.equal([1,0]);
    });
  });

  describe('adding animations', function() {
    let state = app.app(undefined, {type: 'ADD_ANIMATION', animationName: 'Base', id: 0});
    it('should have added the animation to the entities.', function() {
      expect(state.entities.animations).to.not.be.empty;
      expect(state.entities.animations['0']).to.deep.equal({id: 0, name: 'Base', frames: []});
    });

    describe('selecting animations.', function() {
      let secondAnimationAddedState = app.app(state, {type: 'ADD_ANIMATION', animationName: 'Base2', id: 1});
      let selectedState = app.app(secondAnimationAddedState, {type: 'SELECT_ANIMATION', animation: 0});
      it('should have updated the selected animation', function() {
        expect(selectedState.selectedAnimation).to.equal(0);
      });
    });

    describe('renaming animations.', function() {
      let renamedState = app.app(state, {type: 'RENAME_ANIMATION', newName: 'Base2', animation: 0});
      it('should have updated the animation\'s name.', function() {
        expect(renamedState.entities.animations['0']).to.deep.equal({id: 0, name: 'Base2', frames: []});
      });
    });

    it('should have marked the animation as selected.', function() {
      expect(state.selectedAnimation).to.equal(0);
    });

    describe('adding a frame to an already added animation.', function() {
      let frameAddAction = {type: 'ADD_FRAME_TO_ANIMATION', animation: 0, id: 0};

      describe('selecting a frame.', function() {
        let testState = app.app(state, frameAddAction);
        testState = app.app(testState, {...frameAddAction, ...{id: frameAddAction.id + 1}});
        testState = app.app(testState, {type: 'SELECT_FRAME', frame: 0});
        expect(testState.selectedFrame).to.equal(0);
      });

      it('should have added the frame to the frame entities.', function() {
        let frameAddedState = app.app(state, frameAddAction);
        expect(frameAddedState.entities.frames).to.not.be.empty;
        expect(frameAddedState.entities.frames['0'].duration).to.equal(500);
      });

      it('should have added the frame id to the animation.', function() {
        let frameAddedState = app.app(state, frameAddAction);
        expect(frameAddedState.entities.animations['0'].frames).to.contain(0);
      });

      it('should have automatically marked the frame as selected.', function() {
        let frameAddedState = app.app(state, frameAddAction);
        expect(frameAddedState.selectedFrame).to.equal(0);
      });

      it('should correctly update the duration of the frame.', function() {
        let frameAddedState = app.app(state, frameAddAction);
        frameAddedState = app.app(frameAddedState, {type: 'SET_DURATION_FOR_FRAME', frame: 0, duration: 600})
        expect(frameAddedState.entities.frames['0'].duration).to.equal(600);
      });

      describe('adding a frame when files already exist.', function() {
        it('should add a fileFrame for each file already added.', function() {
          let fileFrameState = app.app(state, {type: 'ADD_FILE', fileName: 'test.png', id: 0});
          fileFrameState = app.app(fileFrameState, frameAddAction);
          expect(fileFrameState.entities.frames['0'].fileFrames).to.have.length(1);
        });
      });

      describe('editing frame values.', function() {
        let fileFrameState;
        beforeEach(function() {
          fileFrameState = app.app(state, {type: 'ADD_FILE', fileName: 'test.png', id: 0});
          fileFrameState = app.app(fileFrameState, frameAddAction);
        });

        it('should correctly update the left of the selected file frame.', function() {
          fileFrameState = app.app(fileFrameState, {type: 'INCREMENT_LEFT_FOR_SELECTED_FILE_FRAME'});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].left).to.equal(1);

          fileFrameState = app.app(fileFrameState, {type: 'DECREMENT_LEFT_FOR_SELECTED_FILE_FRAME'});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].left).to.equal(0);

          fileFrameState = app.app(fileFrameState, {type: 'SET_LEFT_FOR_SELECTED_FILE_FRAME', left: 20});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].left).to.equal(20);
        });

        it('should correctly update the top of the selected file frame.', function() {
          fileFrameState = app.app(fileFrameState, {type: 'INCREMENT_TOP_FOR_SELECTED_FILE_FRAME'});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].top).to.equal(1);

          fileFrameState = app.app(fileFrameState, {type: 'DECREMENT_TOP_FOR_SELECTED_FILE_FRAME'});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].top).to.equal(0);

          fileFrameState = app.app(fileFrameState, {type: 'SET_TOP_FOR_SELECTED_FILE_FRAME', top: 20});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].top).to.equal(20);
        });

        it('should correctly update the visibility of the selected file frame.', function() {
          fileFrameState = app.app(fileFrameState, {type: 'SET_VISIBILITY_FOR_SELECTED_FILE_FRAME', visible: false});
          expect(fileFrameState.entities.frames['0'].fileFrames[0].visible).to.be.false;;
        });

        it('should update when rotating the selected fileFrame.', function() {
          let newFrame = app.app(fileFrameState, {type: 'ROTATE_LEFT_FOR_SELECTED_FILE_FRAME'});
          expect(newFrame.entities.frames['0'].fileFrames[0].rotation).to.equal(-1);
          newFrame = app.app(fileFrameState, {type: 'ROTATE_RIGHT_FOR_SELECTED_FILE_FRAME'});
          expect(newFrame.entities.frames['0'].fileFrames[0].rotation).to.equal(1);
          newFrame = app.app(fileFrameState, {type: 'SET_ROTATION_FOR_SELECTED_FILE_FRAME', value: 50});
          expect(newFrame.entities.frames['0'].fileFrames[0].rotation).to.equal(50);
        });

      });
    });

    describe('deleting frames', function() {
      let frameAddAction0 = {type: 'ADD_FRAME_TO_ANIMATION', animation: 0, id: 0};
      let frameAddAction1 = {type: 'ADD_FRAME_TO_ANIMATION', animation: 0, id: 1};
      let addedState = app.app(state, frameAddAction0);
      addedState = app.app(addedState, frameAddAction1);

      it('should remove the second frame and auto select the first frame.', function() {
        let removedState = app.app(addedState, {type: 'DELETE_FRAME', id: 1});
        expect(Object.keys(removedState.entities.frames)).to.deep.equal(['0']);
        expect(removedState.selectedFrame).to.equal(0);
      });

      it('should remove the delted frame from the animation that it was added to.', function() {
        let removedState = app.app(addedState, {type: 'DELETE_FRAME', id: 1});
        expect(removedState.entities.animations['0'].frames).to.deep.equal([0]);
      });
    });
  });
});
