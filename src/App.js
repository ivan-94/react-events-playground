const React = window.React;
const { useState } = React;
const { HoverResponder, useHoverResponder } = window.ReactEventsHover;

function Hover() {
  const [parentHovered, setParentHovered] = useState(false);
  const [childHovered, setChildHovered] = useState(false);
  // 用use*Listener设置回调
  // 用responder设置参数
  const parentListener = useHoverResponder({
    onHoverChange: e => {
      console.log('parent hover change', e);
      setParentHovered(e);
    },
  });

  const childListener = useHoverResponder({
    onHoverChange: e => {
      console.log('child hover change', e);
      setChildHovered(e);
    },
  });

  return (
    <div className={`parent ${parentHovered ? 'active' : ''}`} listeners={parentListener}>
      <div className={`child ${childHovered ? 'active' : ''}`} listeners={childListener}></div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Hover />
    </div>
  );
}

export default App;
