export interface IPoint {
    x: number;
    y: number;
}
 
export class CollisionUitls {
 
    /**
     * 返回矩形的顶点坐标位置 相对于当前父节点的坐标点。
     * @param shap 
     */
    public static getRectangleVerPoints(shap: cc.Node,parentNode: cc.Node): IPoint[] {
 
        let mat4: cc.Mat4 = new cc.Mat4();
        
        shap.getWorldMatrix(mat4);
        const m = mat4.m;

        const a = m[0];
        const b = m[4];
        const c = m[1];
        const d = m[5];

        const tx = m[3];
        const ty = m[7];

        const w = shap.width;
        const h = shap.height;

        // console.log(`w is ${w} and h is ${h}`);
 
 
        const p1x = -w / 2;
        const p1y = -h / 2;
 
        const p2x = w / 2;
        const p2y = -h / 2;
 
        const p3x = w / 2;
        const p3y = h / 2;
 
        const p4x = -w / 2;
        const p4y = h / 2;

        // console.log(`a is ${a} b is ${b} c is ${c} d is ${d},tx is ${tx} ty is ${ty}`);
 
 
        // a: 缩放或者旋转图像是影响沿x轴定位的值
        // b: 旋转或者倾斜影响y轴定位的值
        // 对x坐标有影响的值为a 和 c的值
        // 对y坐标有影响的值为b 和 d的值
        // const p1 = { x: a * p1x + b * p1y + tx, y: c * p1x + d * p1y + ty };
        // const p2 = { x: a * p2x + b * p2y + tx, y: c * p2x + d * p2y + ty };
        // const p3 = { x: a * p3x + b * p3y + tx, y: c * p3x + d * p3y + ty };
        // const p4 = { x: a * p4x + b * p4y + tx, y: c * p4x + d * p4y + ty };

        const angle = shap.angle;
        const ra = (Math.PI * angle) / 180;
        const transPos = (p: IPoint) => {
            const p1Pos = shap.convertToWorldSpaceAR(cc.v2(p.x,p.y));
            const p1Local = parentNode.convertToNodeSpaceAR(p1Pos);

            const shapCenter = shap.parent.convertToWorldSpaceAR(shap.getPosition());
            
            // const x1 = (p1Pos.x - shapCenter.x) * Math.cos(ra) - (p1Pos.y - shapCenter.y) * Math.sin(ra) + shapCenter.x;
            // const y1 = (p1Pos.y - shapCenter.y) * Math.cos(ra) + (p1Pos.x - shapCenter.x) * Math.sin(ra) + shapCenter.y;
            
            

            return {x: p1Local.x,y: p1Local.y};
        }
 
        return [transPos({x: p1x,y: p1y}),transPos({x: p2x,y: p2y}),transPos({x: p3x,y: p3y}),transPos({x: p4x,y: p4y})];
    }
 
    /**
     * 检测圆和多边形
     * @param obj1 
     * @param obj2 
     */
    public static TestCircleAndPolygon(CircleX: number, CircleY: number,r:number, PolygonVertexPoints: IPoint[]): boolean {
        for (let i: number = 0; i < PolygonVertexPoints.length; i++) {
            let startPoint = PolygonVertexPoints[i];
            let endPoint;
            let sideNorVec;
 
            if (i != PolygonVertexPoints.length - 1) {
                endPoint = PolygonVertexPoints[i + 1];
            } else {
                //最后一个
                endPoint = PolygonVertexPoints[0];
            }
            sideNorVec = CollisionUitls.get2PointVec(startPoint, endPoint, false);
 
            //这个边的法相量方向（标准化过的）
            let dotNorVec = CollisionUitls.getSideNorml(sideNorVec, false);
            const data1 = CollisionUitls.calcProj(dotNorVec, PolygonVertexPoints);
            const dot = CollisionUitls.dot([CircleX, CircleY], CollisionUitls.normalize(dotNorVec));
 
            const value = CollisionUitls.segDist(data1.min, data1.max, dot-r, dot+r);
            if (!value) {
                return false;
            }
        }
        return true;
    }
 
 
    /**
     * 检测两个矩形是否相交 
     * @param r1PointList 矩形顶点数组
     * @param r2PointList 
     */
    public static checkPolygon(r1PointList: IPoint[], r2PointList: IPoint[]): boolean {
        
        var fun1 = function (pointlist: IPoint[], vertexPoints1: IPoint[], vertexPoints2: IPoint[]): boolean {
            //先计算 r1的边 ---》 顺时针
            for (let i: number = 0; i < pointlist.length; i++) {
                let startPoint = pointlist[i];
                let endPoint;
                let sideNorVec;
 
                if (i != pointlist.length - 1) {
                    endPoint = pointlist[i + 1];
                } else {
                    //最后一个
 
 
                    endPoint = pointlist[0];
                }
                sideNorVec = CollisionUitls.get2PointVec(startPoint, endPoint, false);
 
                //这个边的法相量方向（标准化过的）
                let dotNorVec = CollisionUitls.getSideNorml(sideNorVec, false);
                const data1 = CollisionUitls.calcProj(dotNorVec, vertexPoints1);
                const data2 = CollisionUitls.calcProj(dotNorVec, vertexPoints2);
                const value = CollisionUitls.segDist(data1.min, data1.max, data2.min, data2.max);
                if (!value) {
                    return false;
                }
 
            }
            return true;
        }
 
        if (!fun1(r1PointList, r1PointList, r2PointList)) {
            return false;
        }
 
        if (!fun1(r2PointList, r1PointList, r2PointList)) {
            return false;
        }
        return true;
 
 
    }
 
    /**
     * 计算某个图形坐标点到当前轴上的投影最小点
     * @param axis 
     * @param objPoints 
     */
    public static calcProj(axis: number[], objPoints: IPoint[]): { min: number, max: number } {
 
        let min = 0;
        let max = 0;
        for (let i: number = 0; i < objPoints.length; i++) {
            const vec2 = [objPoints[i].x, objPoints[i].y];
 
 
            const dot = CollisionUitls.dot(vec2, CollisionUitls.normalize(axis));
 
            //const dot = CollisionUitls.dot(vec2,axis);
 
            if (min == 0 || max == 0) {
                min = max = dot;
            } else {
                min = (dot < min) ? dot : min;
                max = (dot > max) ? dot : max;
            }
 
        }
 
        return { min: min, max: max }
    }
 
 
 
    /**
     * 计算同一个轴上线段的距离s1(min1,max1),s2(min2,max2),如果距离小于0则表示两线段有相交;
     * @param min1 
     * @param max1 
     * @param min2 
     * @param max2 
     * @returns true: 相交 false: 不相交
     */
    public static segDist(min1: number, max1: number, min2: number, max2: number): boolean {
        if (min1 < min2) {
            return min2 < max1 && max2 > min1;
        }
        else {
            return min1 < max2 && max1 > min2;
        }
    }
 
    /**
     * 计算两点向量方向
     * @param p1 
     * @param p2 
     */
    public static get2PointVec(p1: IPoint, p2: IPoint, isNormlize = true): number[] {
 
 
        const x = p2.x - p1.x;
        const y = p2.y - p1.y;
 
 
 
        if (isNormlize) {
            return CollisionUitls.normalize([x, y]);
        }
        return [x, y];
    }
 
 
    /**
     * 根据当前多边形边长获取对应边长的 法线向量
     * @param vec2 
     */
    public static getSideNorml(vec2: number[], isNormlize = true): number[] {
 
        const x = vec2[0];
        const y = vec2[1];
 
        //顺时针方向的法相量 
        //normal=(-y,x) || normal=(y,-x)
        if (isNormlize) {
            CollisionUitls.normalize([-y, x])
        }
        return [-y, x];
    }
 
    public static normalize(vec2: number[]): number[] {
        if (vec2.length != 2) {
            console.error("只能标准化2d向量")
            return vec2;
        }
        const x = vec2[0];
        const y = vec2[1];
        const model = Math.sqrt(x * x + y * y);
 
 
        return [x / model, y / model];
    }
    /**
     * 计算两个向量的点积
     * @param vec2A 
     * @param vec2B 
     */
    public static dot(vec2A: number[], vec2B: number[]): number {
        if (vec2A.length != 2 || vec2B.length != 2) {
            console.error("只能计算2d向量的点积")
            return null;
        }
 
        return vec2A[0] * vec2B[0] + vec2A[1] * vec2B[1];
    }
}
