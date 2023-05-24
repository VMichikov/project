import React, { useState, useEffect } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

const VideoCall = ({ stream }) => {
  const localVideo = React.createRef();

  // localVideo.current is null on first render
  // localVideo.current.srcObject = stream;

  useEffect(() => {
    // Let's update the srcObject only after the ref has been set
    // and then every time the stream prop updates
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <div>
      {/* <video style={{ height: 300, width: 300 }} ref={localVideo} autoPlay /> */}
      <video ref={localVideo} autoPlay />
    </div>
  );
};

export default VideoCall;
