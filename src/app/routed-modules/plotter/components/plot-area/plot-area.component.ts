import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vertex } from 'src/app/shared/vertex';
import { Path, Point, Shape } from 'paper';
import * as paper from 'paper';

@Component({
  selector: 'app-plot-area',
  templateUrl: './plot-area.component.html',
  styleUrls: ['./plot-area.component.scss']
})
export class PlotAreaComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  path: any;
  currentX: number;
  currentY: number;
  vertexList: Vertex[] = [];
  polygonArea: number;

  constructor() { }

  ngOnInit(): void {
    paper.setup(this.canvas.nativeElement);
  }

  getCurrentPosision(event): void {
    const rect = event.target.getBoundingClientRect();
    this.currentX = event.clientX - rect.left;
    this.currentY = event.clientY - rect.top;
  }

  onClickCanvas(): void {
    // 多角形の面積が計算されている=パスが閉じられている時はプロットできないようにする
    if (this.polygonArea) { return; }
    // プロットする前に予め空のPathオブジェクトを生成する
    if (this.vertexList.length === 0) {
      this.path = new Path();
    }
    // パスの頂点座標の配列にクリック位置のx, y座標を追加する
    this.vertexList.push({
      x: this.currentX,
      y: this.currentY,
    });
    this.plotRectangle();
    this.drawLine();
  }

  closePath(): void {
    // 何もプロットされていない場合はパスを閉じられないようにする
    if (this.vertexList.length === 0) { return; }
    this.path.closePath();
    this.path.fillColor = 'rgb(255, 0, 0, 0.2)';
    this.calculatePolygonArea();
  }

  clearAll(): void {
    paper.project.activeLayer.removeChildren();
    this.polygonArea = null;
    this.vertexList = [];
  }

  calculatePolygonArea(): void {
    // 多角形の面積を計算する
    const lastIndex = this.vertexList.length - 1;
    const sum = this.vertexList.reduce((prev, curValue, curIndex, array) => {
      const nextIndex = curIndex === lastIndex ? 0 : curIndex + 1;
      return prev + (curValue.x * array[nextIndex].y - array[nextIndex].x * curValue.y)
    }, 0);
    this.polygonArea = Math.abs(sum) / 2;
  }

  private plotRectangle(): void {
    new Shape.Rectangle({
      center: new Point(this.currentX, this.currentY),
      size: 8,
      strokeColor: 'rgb(255, 0, 0)',
    });
  }

  private drawLine(): void {
    this.path.strokeColor = 'rgb(255, 0, 0)';
    this.path.strokeWidth = 2;
    this.path.add(new Point(this.currentX, this.currentY));
  }
}
