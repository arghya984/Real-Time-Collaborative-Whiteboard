import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [history, setHistory] = useState<fabric.Object[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.isDrawingMode = true;
    canvas.selection = false;

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = brushSize;

    canvas.on('path:created', (e: any) => {
      const path = e.path;
      setHistory(prev => [...prev.slice(0, currentStep + 1), path]);
      setCurrentStep(prev => prev + 1);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        redo();
      } else if (e.ctrlKey && e.key === 's') {
        saveImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('path:created');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [color, brushSize, currentStep]);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas('canvas', {
        width,
        height,
      });
    }

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [width, height]);

  const changeColor = (newColor: string) => {
    setColor(newColor);
    if (canvasRef.current) {
      canvasRef.current.freeDrawingBrush.color = newColor;
    }
  };

  const changeBrushSize = (newSize: number) => {
    setBrushSize(newSize);
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const objects = canvasRef.current?.getObjects();
      if (objects && objects.length > 0) {
        const lastObject = objects[objects.length - 1];
        canvasRef.current?.remove(lastObject);
      }
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(prev => prev + 1);
      canvasRef.current?.add(history[currentStep + 1]);
    }
  };

  const saveImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL({ format: 'png' });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'whiteboard.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div>
      <h4>Adjust The Brush size before start writing</h4>
      <canvas id="canvas" width={width} height={height} style={canvasStyle} />
      <div>
        <label>Color:</label>
        <input type="color" value={color} onChange={(e) => changeColor(e.target.value)} />
      </div>
      <div>
        <label>Brush Size:</label>
        <input type="range" min="1" max="20" value={brushSize} onChange={(e) => changeBrushSize(parseInt(e.target.value))} />
      </div>
      <div>
        <button onClick={undo} className="btn btn-secondary" style={{ marginRight: '10px' }}>Undo (Ctrl+z)</button>
        <button onClick={redo} className="btn btn-secondary" style={{ marginRight: '10px' }}>Redo (Ctrl+y)</button>
        <button onClick={saveImage} className="btn btn-secondary">Save Image (Ctrl+s)</button>
      </div>
    </div>
  );
};

export default Canvas;

const canvasStyle = {
  border: "1px solid black"
};
