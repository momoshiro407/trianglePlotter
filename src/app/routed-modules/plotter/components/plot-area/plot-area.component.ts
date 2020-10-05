import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vertex } from 'src/app/shared/vertex';
import { Group, Path, Point, Shape } from 'paper';
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
  pathGroup: any;
  unsettledPath: any;
  currentX: number;
  currentY: number;
  vertexList: Vertex[] = [];
  polygonArea: number;
  isCross = false;
  isMoueOnSegment = false;
  activeItem: any;

  constructor() { }

  ngOnInit(): void {
    paper.setup(this.canvas.nativeElement);
    this.initialItemSetting();
  }

  getCurrentPosision(event): void {
    const rect = event.target.getBoundingClientRect();
    this.currentX = event.clientX - rect.left;
    this.currentY = event.clientY - rect.top;
    this.drawUnsettledLine();
  }

  onClickCanvas(): void {
    if (this.isCross) {
      alert('パスが交差する位置に点を打つことは出来ません。');
      return;
    }
    // 多角形の面積が計算されている=パスが閉じられている時はプロットできないようにする
    if (this.polygonArea) { return; }
    // パスの頂点座標の配列にクリック位置のx, y座標を追加する
    this.vertexList.push({
      x: this.currentX,
      y: this.currentY,
    });
    this.plotMarker();
    this.drawLine();
  }

  closePath(): void {
    // 何もプロットされていない場合はパスを閉じられないようにする
    if (this.vertexList.length === 0) { return; }
    this.path.closePath();
    this.path.fillColor = 'rgb(255, 0, 0, 0.2)';
    this.unsettledPath.removeSegments();
    this.calculatePolygonArea();
  }

  clearAll(): void {
    paper.project.activeLayer.removeChildren();
    this.polygonArea = null;
    this.vertexList = [];
    this.isCross = false;
    this.initialItemSetting();
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

  private initialItemSetting(): void {
    this.path = new Path();
    this.setMouseEventToPath();
    this.unsettledPath = new Path();
    this.pathGroup = new Group();
    this.pathGroup.addChild(this.path);
  }

  private plotMarker(): void {
    // 正方形のマーカー（パスの頂点を明示する印）を生成する
    const marker = new Shape.Rectangle({
      center: new Point(this.currentX, this.currentY),
      size: 8,
      strokeColor: 'rgb(255, 0, 0)',
    });
    this.pathGroup.addChild(marker);
  }

  private drawLine(): void {
    this.path.strokeColor = 'rgb(255, 0, 0)';
    this.path.strokeWidth = 2;
    this.path.add(new Point(this.currentX, this.currentY));
    this.unsettledPath.removeSegments();
  }

  private drawUnsettledLine(): void {
    // 何もプロットされていない、もしくは面積が計算済みの場合は未確定パスを描画しない
    if (this.vertexList.length === 0 || this.polygonArea) { return; }
    this.unsettledPath.removeSegments();
    // 未確定パスの設定
    this.unsettledPath.strokeColor = 'rgb(0, 0, 0, 0.1)';
    this.unsettledPath.strokeWidth = 1;
    // 確定パスの最先端にある頂点座標を取得する
    const lastSegment = this.path.lastSegment.point;
    // 未確定パスの始点
    this.unsettledPath.add(new Point(lastSegment.x, lastSegment.y));
    // 未確定パスの終点
    this.unsettledPath.add(new Point(this.currentX, this.currentY));

    // 確定パスと未確定パスの交差を判定する
    this.checkCrossing();
  }

  private checkCrossing(): void {
    const interSection = this.path.getIntersections(this.unsettledPath);
    this.isCross = interSection.length > 1;
  }

  private setMouseEventToPath(): void {
    this.path.onMouseMove = (event) => {
      if (this.polygonArea) {
        const hitOptions = {
          fill: false,
          stroke: false,
          segments: true,
          tolerance: 10,
        };
        const hitResult = paper.project.hitTest(event.point, hitOptions);
        this.activeItem = hitResult && hitResult.segment;
        this.isMoueOnSegment = !!this.activeItem;
      }
    };

    this.path.onMouseDrag = (event) => {
      if (this.activeItem) {
        const index = this.activeItem.index;
        // パスのセグメントの座標を更新する
        this.activeItem.point.x = event.point.x;
        this.activeItem.point.y = event.point.y;
        // パス頂点のマーカーの座標を更新する
        this.pathGroup.children[index + 1].position.x = event.point.x;
        this.pathGroup.children[index + 1].position.y = event.point.y;
      }
    };

    this.path.onMouseUp = () => {
      if (this.activeItem) {
        const index = this.activeItem.index;
        this.vertexList[index].x = this.activeItem.point.x;
        this.vertexList[index].y = this.activeItem.point.y;
        // 面積を再計算する
        this.calculatePolygonArea();
      }
    };
  }
}
