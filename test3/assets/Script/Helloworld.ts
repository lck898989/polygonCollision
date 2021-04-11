import { CollisionUitls,IPoint} from "./CollisionUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.Node)
    s: cc.Node = null;

    @property(cc.Node)
    five: cc.Node = null;

    @property(cc.Graphics)
    pen: cc.Graphics = null;

    @property(cc.Graphics)
    penB: cc.Graphics = null;


    private fivePolygon: IPoint[] = [];
    private sPolygon: IPoint[] = [];

    private hasDraw = false;

    start () {
        // init logic
        // this.label.string = this.text;

        this.hasDraw = false;

        // this.pen.moveTo(cocosBox.x,cocosBox.y);
        this.fivePolygon = CollisionUitls.getRectangleVerPoints(this.five,this.node);
        // this.sPolygon = CollisionUitls.getRectangleVerPoints(this.s);
        this.sPolygon = CollisionUitls.getRectangleVerPoints(this.s,this.node);

        // this.s.angle = 30;

        
        this.drawPath(this.fivePolygon,this.five,this.penB);
        // this.drawPath(this.sPolygon,this.s,this.pen);

        const sChildren = this.s.children;
        for(let i = 0; i < sChildren.length; i++) {
            const worldPos = sChildren[i].parent.convertToWorldSpaceAR(sChildren[i].getPosition());
            const localPos = this.pen.node.convertToNodeSpaceAR(worldPos);
            // const localPos = sChildren[i].getPosition();
            if(i === 0) {
                this.pen.moveTo(localPos.x,localPos.y);
            } else {
                this.pen.lineTo(localPos.x,localPos.y);
            }
        }
        this.pen.close();
        this.pen.stroke();

        this.schedule(() => {
            // this.drawPath(this.sPolygon,this.s,this.pen);
            // console.log();
            this.s.angle -= 30;
            this.pen.node.angle -= 30;
            // this.s.rotation -= 30;
            
            this.sPolygon = CollisionUitls.getRectangleVerPoints(this.s,this.node);
            // this.drawPath(this.sPolygon,this.s,this.pen);

            let res = CollisionUitls.checkPolygon(this.sPolygon,this.fivePolygon);
            this.label.string = `是否碰撞：${res}`;
        },2);

    }

    drawBox(rect: cc.Rect) {
        this.pen.rect(rect.x,rect.y,rect.width,rect.height);
        this.pen.stroke();
    }

    getBoxWithRotate(rect: cc.Rect,node: cc.Node) {
        const angle = node.angle;


    }

    drawPath(posArr: IPoint[],parentNode: cc.Node,pen: cc.Graphics) {
        
        const len = posArr.length;

        pen.clear();
        for(let i = 0; i < len; i++) {
            const posItem = cc.v2(posArr[i].x,posArr[i].y);

            if(i === 0) {
                pen.moveTo(posItem.x,posItem.y);
            } else {
                pen.lineTo(posItem.x,posItem.y);
            }
        }
        pen.close();
        pen.stroke();

    }

    update(dt: number) {

        // this.s.angle -= dt * 100;

        
    }
}
