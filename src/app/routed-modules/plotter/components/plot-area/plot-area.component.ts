import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Vertex } from 'src/app/shared/model/vertex';
import { Group, Path, Point, Shape } from 'paper';
import * as paper from 'paper';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-plot-area',
  templateUrl: './plot-area.component.html',
  styleUrls: ['./plot-area.component.scss']
})
export class PlotAreaComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  // パスオブジェクト関係
  path: any;
  pathGroup: any;
  unsettledPath: any;
  // マウスポインターの座標関係
  currentX: number;
  currentY: number;
  editStartX: number;
  editStartY: number;
　// 面積計算関係
  vertexList: Vertex[] = [];
  polygonArea: number;
  // 各種フラグ
  isCross = false;
  isMouseOnSegment = false;
  isMouseOnStroke = false;
  isMouseDragging = false;
  // オンマウス状態のパスの子オブジェクト
  activeSegment: any;
  activeStrokeLocation: any;
  // コンテキストメニュー関係
  contextMenuPosition = { x: '0px', y: '0px' };
  isEditMenuOpened = false;

  constructor(
    public viewContainerRef: ViewContainerRef,
  ) { }

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
      // 交差フラグをクリアする
      this.isCross = false;
      return;
    }
    // 多角形の面積が計算されている=パスが閉じられている時はプロットできないようにする
    if (this.polygonArea) { return; }
    // パスの頂点座標の配列にクリック位置のx, y座標を追加する
    this.vertexList.push({
      x: this.currentX,
      y: this.currentY,
    });
    this.plotMarker(this.currentX, this.currentY);
    this.drawLine();
  }

  closePath(): void {
    // プロット数が3点未満の場合はパスを閉じられないようにする
    if (this.path.segments.length < 3) { return; }
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

  openMenu(event: MouseEvent): boolean{
    // カーソルが多角形のセグメント上にもストローク上にもない場合は頂点編集メニューを開く
    if (!this.isMouseOnSegment && !this.isMouseOnStroke) { return true; }
    this.isEditMenuOpened = true;
    // デフォルトのコンテキストメニューを開かないようにする
    event.preventDefault();
    // 右クリックした時点のマウスポインターの座標を保持する
    this.editStartX = this.currentX;
    this.editStartY = this.currentY;
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  addSegment(): void {
    const insertIndex = this.activeStrokeLocation.index + 1;
    this.path.insert(insertIndex, new Point(this.editStartX, this.editStartY));
    this.vertexList.splice(insertIndex, 0, {x: this.editStartX, y: this.editStartY});
    this.plotMarker(this.editStartX, this.editStartY, insertIndex);
    this.contextMenu.closeMenu();
  }

  removeSegment(): void {
    // 現在の頂点数が3個の場合は削除できないようにする
    if (this.path.segments.length === 3) {
      alert('多角形の描画には3個以上の頂点が必要です。');
      this.contextMenu.closeMenu();
      return;
    }
    const removeIndex = this.activeSegment.index;
    this.path.removeSegment(removeIndex);
    this.vertexList.splice(removeIndex, 1);
    this.pathGroup.removeChildren(removeIndex + 1, removeIndex + 2);
    this.contextMenu.closeMenu();
    this.isMouseOnSegment = false;
  }

  afterMenuClosed(): void {
    this.isEditMenuOpened = false;
    this.activeSegment = null;
    this.activeStrokeLocation = null;
    this.isMouseOnSegment = false;
    this.isMouseOnStroke = false;
  }

  private initialItemSetting(): void {
    this.path = new Path();
    this.setMouseEventToPath();
    this.unsettledPath = new Path();
    this.pathGroup = new Group();
    this.pathGroup.addChild(this.path);
  }

  private plotMarker(x: number, y: number, insertIndex?: number): void {
    // 正方形のマーカー（パスの頂点を明示する印）を生成する
    const marker = new Shape.Rectangle({
      center: new Point(x, y),
      size: 8,
      strokeColor: 'rgb(255, 0, 0)',
    });
    if (insertIndex) {
      // 頂点追加処理の場合、パスグループの既存の子要素配列の間に挿入する
      this.pathGroup.insertChild(insertIndex + 1, marker);
    } else {
      // 多角形を閉じる前はパスグループの子要素配列の末尾に追加していく
      this.pathGroup.addChild(marker);
    }
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
      // 頂点編集メニューが表示されている場合はイベントを実行しない
      if (this.isEditMenuOpened) { return; }
      if (this.polygonArea) {
        // セグメントとストロークの当たり判定のみを有効にする
        const hitOptions = {
          fill: false,
          stroke: true,
          segments: true,
          tolerance: 1,
        };
        const hitResult = paper.project.hitTest(event.point, hitOptions);
        this.activeSegment = hitResult && hitResult.segment;
        this.isMouseOnSegment = !!this.activeSegment;
        this.activeStrokeLocation = hitResult && hitResult.type === 'stroke' ? hitResult.location : null;
        this.isMouseOnStroke = !!this.activeStrokeLocation;
      }
    };

    this.path.onMouseDrag = (event) => {
      if (this.activeSegment) {
        const index = this.activeSegment.index;
        this.isMouseDragging = true;
        // パスのセグメントの座標を更新する
        this.activeSegment.point.x = event.point.x;
        this.activeSegment.point.y = event.point.y;
        // パス頂点のマーカーの座標を更新する
        this.pathGroup.children[index + 1].position.x = event.point.x;
        this.pathGroup.children[index + 1].position.y = event.point.y;
        // パス同士の交差を判定する
        const interSection = this.path.getIntersections(this.path);
        this.isCross = interSection.length > 0;
      }
    };

    this.path.onMouseUp = () => {
      if (this.activeSegment) {
        const index = this.activeSegment.index;
        if (this.isCross) {
          // パスのセグメントの座標をドラッグ移動前に戻す
          this.activeSegment.point.x = this.vertexList[index].x;
          this.activeSegment.point.y = this.vertexList[index].y;
          // パス頂点のマーカーの座標をドラッグ移動前に戻す
          this.pathGroup.children[index + 1].position.x = this.vertexList[index].x;
          this.pathGroup.children[index + 1].position.y = this.vertexList[index].y;
          // セグメントからカーソルが離れるのでオンマウスのフラグをクリアする
          this.isMouseOnSegment = false;
          return;
        }
        this.vertexList[index].x = this.activeSegment.point.x;
        this.vertexList[index].y = this.activeSegment.point.y;
        this.isMouseDragging  = false;
        // 面積を再計算する
        this.calculatePolygonArea();
      }
    };

    this.path.onMouseLeave = () => {
      // 頂点編集メニューが表示されている場合はイベントを実行しない
      if (this.isEditMenuOpened) { return; }
      if (this.activeSegment) {
        // セグメントをドラッグしている途中の場合は処理を行わない
        if (this.isMouseDragging) { return; }
        // セグメントからマウスが離れた場合はactiveItemとオンマウスのフラグをクリアする
        this.activeSegment = null;
        this.isMouseOnSegment = false;
      }
      this.isMouseOnStroke = false;
    };
  }
}
