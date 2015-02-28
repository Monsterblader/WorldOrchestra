describe('AudioFactory', function(){
  var setupStub, JSONresponse, list, setupSpy, promise;
  var appView, waveSurfer, spy1;
  describe('Play Audio File', function() {
    beforeEach(function () {
      appView = new WO.AppView();
      appView.songView.collection.add(new WO.Track());
      waveSurfer = Object.create(WaveSurfer);
      spy1 = sinon.spy(waveSurfer, play);
      appView.songView.collection.at(0).set('instrument', waveSurfer);
    //  this.server = sinon.fakeServer.create();
    //  list = ["1", "2", "3"];
    //  setupSpy = sinon.stub(todo, "setup");
      $("#play").click();
    });

    afterEach(function() {
      spy1.restore();
    //  this.server.restore();
    });

    it('todo.setup receives an array of todos when todo.init is called', function () {
    //  this.server.respondWith("GET", "/todos",
    //      [200, {"Content-Type": "application/json"},
    //        JSON.stringify(list)]);
    //  todo.init();
      expect(spy1.callCount).to.be(1);
    //  expect(setupSpy.calledWith(JSON.stringify(list))).to.be.true;
    });
  });
});

