import React, { createRef, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import keyNames from "../utils/keycodes.json";
import { css } from "@emotion/react";
import useGlobalKeyboardListener from "../hooks/useGlobalKeyboardListener";
import DEFAULT_LAYOUT from "../keyboard-layouts/qwerty-100.json";
import useWindowSize from "../hooks/useWindowSize";
import Keycap from "./Keycap";
import DynamicPortal from "./DynamicPortal";
import { AnimatePresence, motion } from "framer-motion";
import StandaloneWindow from "./StandaloneWindow";
import DrawerItem from "./DrawerItem";
import { useUIState } from "../contexts/UIContext";
import KeycapProperties from "./KeycapProperties";
import { DndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import useGlobalMouseListener from "../hooks/useGlobalMouseListener";
import CounterInput from "./inputs/CounterInput";
import KeycapSettings from "./KeycapSettings";

const ipcRenderer = window.ipcRenderer;

const UNIT = 70; // px
const KEY_GAP = 5; // px

const T = { kc: 59, h: 1, w: 1, alias: "65", color: "salmon", grey: 2 };

const Container = styled.div`
  position: relative;
  padding: 1rem;
  border: 2px solid ${({ theme }) => theme.colors.onPrimary.main};
  border-radius: 10px;

  margin: 1rem;
  width: min-content;

  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PresentationButton = styled.button`
  -webkit-app-region: no-drag;

  position: absolute;
  bottom: 0;
  right: 0;

  width: 3rem;
  height: 3rem;
  margin: 1rem;

  background-color: #222;
`;

const rowify = (arr) => {
  const finalArray = [];

  const rowNumbers = new Set();
  arr.forEach((item) => {
    rowNumbers.add(item.position.row);
  });

  const rows = [...rowNumbers].sort();

  rows.forEach((row) => {
    finalArray.push(
      arr
        .filter((item) => item.position.row === row)
        .sort((a, b) => a.position.col - b.position.col)
    );
  });

  return finalArray;
};

const KeyboardLayout = ({ layoutConfig = DEFAULT_LAYOUT }) => {
  const {
    drawerState,
    setDrawerState,
    presentationMode,
    setPresentationMode,
    togglePresentationMode,
  } = useUIState();
  const { lastKeyPressed, kbInputs, isKeyPressed } =
    useGlobalKeyboardListener();

  const { mouseInputs, isMouseClickHeld } = useGlobalMouseListener();

  const [layout, setLayout] = useState(layoutConfig.layout);
  const layout2d = rowify(layout);
  const [keySelectedId, setKeySelectedId] = useState(null);
  const keySelected = layout.find((key) => key.id === keySelectedId) ?? null;

  const animProps = {
    variants: {
      open: { x: 0, y: 0 },
      closed: {
        x: -400,
      },
    },
    initial: "closed",
    animate: keySelectedId !== null ? "open" : "closed",
    exit: "closed",
    transition: { duration: 0.25 },
    // transition: { velocity: 500 },
  };

  const isInputOn = (keycode) =>
    isKeyPressed(keycode) || isMouseClickHeld(keycode);
  const deselectKeys = () => setKeySelectedId(null);

  const changeKeyConfig = (id, values) => {
    setLayout((layout) => {
      const index = layout.findIndex((item) => item.id === id);
      if (index !== -1)
        return [
          ...layout.slice(0, index),
          ...layout.slice(index + 1, layout.length),
          { ...layout[index], ...values },
        ];
      else return layout;
    });
  };

  useEffect(() => {
    if (presentationMode) setKeySelectedId(null);
  }, [presentationMode]);

  return (
    <DndContext
      // modifiers={[restrictToParentElement]}
      modifiers={[restrictToWindowEdges]}
    >
      <Container
      // ref={setNodeRef}
      // style={style}
      >
        {presentationMode && (
          <PresentationButton type="button" onClick={togglePresentationMode}>
            P
          </PresentationButton>
        )}
        {layout2d.map((row, i) => (
          <Row key={i}>
            {row.map((keyData, j) => (
              <Keycap
                key={j}
                keyData={keyData}
                // pressed={isKeyPressed(keyData.kc)}
                pressed={isInputOn(keyData.kc)}
                selected={keySelectedId === keyData.id}
                onClick={() => {
                  setPresentationMode(false);
                  if (keySelectedId === keyData.id) deselectKeys();
                  else setKeySelectedId(keyData.id);
                }}
              />
            ))}
          </Row>
        ))}

        {keySelectedId !== null && (
          <DrawerItem>
            <KeycapSettings close={deselectKeys}>
              <Keycap keyData={keySelected} pressed={false} selected={false} />
              <p>name: {keyNames[keySelected.kc]}</p>
              <p>keycode: {keySelected.kc}</p>
              <InputContainer>
                {JSON.stringify(keySelected)}

                <CounterInput
                  id="width-input"
                  label="W"
                  step={0.05}
                  value={keySelected.w}
                  onChange={(val) => {
                    changeKeyConfig(keySelected.id, {
                      w: val,
                    });
                  }}
                />

                <CounterInput
                  id="height-input"
                  label="H"
                  step={0.05}
                  value={keySelected.h}
                  onChange={(val) => {
                    changeKeyConfig(keySelected.id, {
                      h: val,
                    });
                  }}
                />
              </InputContainer>
            </KeycapSettings>
          </DrawerItem>
        )}
      </Container>
    </DndContext>
  );
};

export default KeyboardLayout;

// {
//   "name": "qwerty",
//   "desc": "df",
//   "layout": [
//     [
//       { "kc": 59, "h": 1, "w": 1 },
//       { "kc": 60, "h": 1, "w": 1 },
//       { "kc": 61, "h": 1, "w": 1 },
//       { "kc": 62, "h": 1, "w": 1 },
//       { "kc": 63, "h": 1, "w": 1 },
//       { "kc": 64, "h": 1, "w": 1 },
//       { "kc": 65, "h": 1, "w": 1 },
//       { "kc": 66, "h": 1, "w": 1 },
//       { "kc": 67, "h": 1, "w": 1 },
//       { "kc": 68, "h": 1, "w": 1 },
//       { "kc": 87, "h": 1, "w": 1 },
//       { "kc": 88, "h": 1, "w": 1 }
//     ],
//     [
//       { "kc": 15, "h": 1, "w": 1 },
//       { "kc": 16, "h": 1, "w": 1 },
//       { "kc": 17, "h": 1, "w": 1 },
//       { "kc": 18, "h": 1, "w": 1 },
//       { "kc": 19, "h": 1, "w": 1 },
//       { "kc": 20, "h": 1, "w": 1 },
//       { "kc": 21, "h": 1, "w": 1 },
//       { "kc": 22, "h": 1, "w": 1 },
//       { "kc": 23, "h": 1, "w": 1 },
//       { "kc": 24, "h": 1, "w": 1 },
//       { "kc": 25, "h": 1, "w": 1 },
//       { "kc": 41, "h": 1, "w": 1 }
//     ],
//     [
//       { "kc": 28, "h": 1, "w": 1 },
//       { "kc": 30, "h": 1, "w": 1 },
//       { "kc": 31, "h": 1, "w": 1 },
//       { "kc": 32, "h": 1, "w": 1 },
//       { "kc": 33, "h": 1, "w": 1 },
//       { "kc": 34, "h": 1, "w": 1 },
//       { "kc": 35, "h": 1, "w": 1 },
//       { "kc": 36, "h": 1, "w": 1 },
//       { "kc": 37, "h": 1, "w": 1 },
//       { "kc": 38, "h": 1, "w": 1 },
//       { "kc": 39, "h": 1, "w": 1 },
//       { "kc": 40, "h": 1, "w": 1 }
//     ],
//     [
//       { "kc": 42, "h": 1, "w": 1 },
//       { "kc": 44, "h": 1, "w": 1 },
//       { "kc": 45, "h": 1, "w": 1 },
//       { "kc": 46, "h": 1, "w": 1 },
//       { "kc": 47, "h": 1, "w": 1 },
//       { "kc": 48, "h": 1, "w": 1 },
//       { "kc": 49, "h": 1, "w": 1 },
//       { "kc": 50, "h": 1, "w": 1 },
//       { "kc": 51, "h": 1, "w": 1 },
//       { "kc": 52, "h": 1, "w": 1 },
//       { "kc": 53, "h": 1, "w": 1 },
//       { "kc": 43, "h": 1, "w": 1 }
//     ],
//     [
//       { "kc": 29, "h": 1, "w": 1 },
//       { "kc": 56, "h": 1, "w": 1 },
//       { "kc": 3675, "h": 1, "w": 1 },
//       { "kc": -1, "h": 1, "w": 1 },
//       { "kc": 23, "h": 1, "w": 1 },
//       { "kc": 57, "h": 1, "w": 1 },
//       { "kc": 14, "h": 1, "w": 1 },
//       { "kc": 61011, "h": 1, "w": 1 },
//       { "kc": -1, "h": 1, "w": 1 },
//       { "kc": -1, "h": 1, "w": 1 },
//       { "kc": -1, "h": 1, "w": 1 },
//       { "kc": 57376, "h": 1, "w": 1 }
//     ],
//     [
//       { "kc": 91, "h": 1, "w": 1 },
//       { "kc": 92, "h": 1, "w": 1 },
//       { "kc": 93, "h": 1, "w": 1 },
//       { "kc": 99, "h": 1, "w": 1 },
//       { "kc": 100, "h": 1, "w": 1 },
//       { "kc": 101, "h": 1, "w": 1 },
//       { "kc": 102, "h": 1, "w": 1 },
//       { "kc": 103, "h": 1, "w": 1 },
//       { "kc": 104, "h": 1, "w": 1 },
//       { "kc": 105, "h": 1, "w": 1 },
//       { "kc": 106, "h": 1, "w": 1 },
//       { "kc": 107, "h": 1, "w": 1 }
//     ]
//   ]
// }
