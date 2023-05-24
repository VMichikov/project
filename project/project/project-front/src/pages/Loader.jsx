import React, { Component } from "react";
import "./Loader.css";
class Loader extends Component {
  render() {
    return (
      <div id="loader-div">
        <ul id="Round" className="loader">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    );
  }
}
export default Loader;
