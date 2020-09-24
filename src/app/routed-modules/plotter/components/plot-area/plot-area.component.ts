import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vertex } from 'src/app/shared/vertex';

@Component({
  selector: 'app-plot-area',
  templateUrl: './plot-area.component.html',
  styleUrls: ['./plot-area.component.scss']
})
export class PlotAreaComponent implements OnInit {
  @ViewChild('line', { static: true })
  lineCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('dot', { static: true })
  dotCanvas: ElementRef<HTMLCanvasElement>;

  lineContext: CanvasRenderingContext2D;
  dotContext: CanvasRenderingContext2D;

  currentX: number;
  currentY: number;
  vertexList: Vertex[] = [];
  polygonArea: number;

  constructor() { }

  ngOnInit(): void {
    this.lineContext = this.lineCanvas.nativeElement.getContext('2d');
    this.dotContext = this.dotCanvas.nativeElement.getContext('2d');
  }

  getCurrentPosision(event): void {
    const rect = event.target.getBoundingClientRect();
    this.currentX = event.clientX - rect.left;
    this.currentY = event.clientY - rect.top;
  }

  onClickCanvas(): void {
    // 多角形の面積が計算されている=パスが閉じられている時はプロットできないようにする
    if (this.polygonArea) { return; }
    this.plotDot();
    this.drawLine();
    this.vertexList.push({
      x: this.currentX,
      y: this.currentY,
    });
  }

  closePath(): void {
    this.lineContext.closePath();
    this.lineContext.stroke();
    this.setFillStyle(this.lineContext);
    this.lineContext.fill('evenodd');
    this.calculatePolygonArea();
  }

  clearAll(): void {
    // キャンバスの指定範囲をクリアする
    this.dotContext.clearRect(0, 0, this.dotCanvas.nativeElement.width, this.dotCanvas.nativeElement.height);
    this.lineContext.clearRect(0, 0, this.lineCanvas.nativeElement.width, this.lineCanvas.nativeElement.height);
    this.dotContext.beginPath();
    this.lineContext.beginPath();
    // 頂点座標のリストをクリアする
    this.vertexList = [];
    this.polygonArea = null;
  }

  calculatePolygonArea(): void {
    const lastIndex = this.vertexList.length - 1;
    const sum = this.vertexList.reduce((prev, curValue, curIndex, array) => {
      const nextIndex = curIndex === lastIndex ? 0 :curIndex + 1;
      return prev + (curValue.x * array[nextIndex].y - array[nextIndex].x * curValue.y)
    }, 0);
    this.polygonArea = Math.abs(sum) / 2;
  }

  private plotDot(): void {
    this.setLineStyle(this.dotContext);
    // サブパスのリストを初期化する
    this.dotContext.beginPath();
    // クリック位置を中心とした半径4の円を設定する
    this.dotContext.arc(this.currentX, this.currentY, 4, 0, Math.PI * 2, true);
    // 線を描画する
    this.dotContext.stroke();
  }

  private drawLine(): void {
    this.setLineStyle(this.lineContext);
    // 始点からクリック位置までの直線を設定する
    this.lineContext.lineTo(this.currentX, this.currentY);
    // 線を描画する
    this.lineContext.stroke();
    // TODO: パスが交差する位置に点を打てないようにする
  }

  private setLineStyle(context: CanvasRenderingContext2D): void {
    context.lineWidth = 1;
    context.strokeStyle = 'rgb(255, 0, 0)';
  }

  private setFillStyle(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'rgb(255, 0, 0, 0.2)';
  }
}
