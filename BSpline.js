function arr_equal(a, b){

    if(a.length == b.length){
        for(let i = 0; i < a.length; i++){
            if(a[i] != b[i])return false
        }
        return true
    }
    return false
}

class BSpline{
    constructor(k, P, in_range, openUni = false, auto = true){/*need k + 1 points*/
        this.k = k
        this.P = P
        this.min = Math.min(...in_range)
        this.max = Math.max(...in_range)
        this.range = in_range

        if(openUni)this.openUni()
        this.knots = new Array(this.k + this.P.length + 2)    
        this.distance = (y_co = false) => {
            let longest = 0
            let start = 1
            for(let i = 0; i < this.P.length; i++){
                let [x, y] = this.P[i]
                
                for(let j = start; j < this.P.length; j++){
                    let [X, Y] = this.P[j]
                    let dist = Math.sqrt( (!y_co? Math.pow(X - x, 2) : 0) + Math.pow(Y - (!y_co? y : -y), !y_co? 2 : 1))
                    if(longest < dist)longest = dist
                }
                start++
            }
            return longest
        };
        if(auto)this.auto_generate_knots()
    }
    set_knots(T){
        this.knots = T
        this.knots.sort((a, b) => a - b)
    }
    auto_generate_knots(uniform = 1, start = 0){
        this.knots = new Array(this.k + this.P.length + 2)
        for(let i = 0; i < this.knots.length; i++){
                this.knots[i] = start + uniform * i
        } 
        // console.log(this.knots)
    }
    add_Knot(m){
        this.knots.push(m)

        this.knots.sort((a, b) => a - b)
    }
    openUni(){
        let f = this.P[0]
            let l = this.P[this.P.length - 1]

            for(let i = 0; i < this.k - 1; i++){
                this.P.push(l)
                this.P.splice(0, 0, f)
            }
    }
    add_Point(point, i = false){
        if(i){
            this.P.splice(i, 0, point)
        }else{
            this.P.push(point)
        }
        this.auto_generate_knots()
    }
    remove_Point(at){
            this.P.splice(at, 1)
        this.auto_generate_knots()
    }
    shift_Point(at, by, pos = 0){
        let [x, y] = this.P[at]
        if(pos == 0){
            if((by + x <= this.max) && (by + x >= this.min))x += by
        }else{
            y += by
        }
    }
    clone_(openUni = false){
        return new BSpline(this.k, this.P, this.range, openUni)
    }
    calcN(i, j, t){
        
        var t_i =  this.knots[i]
        if(j == 0){
            if((t_i <= t) && (t < this.knots[i + 1])){
                return 1
            } return 0 
        }
        
        var t_i_j = this.knots[i + j + 1]
        
        return (t - t_i) * this.calcN(i, j - 1, t) / (this.knots[i + j] - t_i) + (t_i_j - t) * this.calcN(i + 1, j - 1, t) / (t_i_j - this.knots[i + 1])
    }
    calcSpline_at(t, j = this.k){
        let accum_x = 0, accum_y = 0, accum_one = 0, temp = []
 
        for(let i = 0; i < this.P.length; i++){
            let Ni_j = this.calcN(i, j, t)
    
            temp.push(Ni_j)
            accum_one+= Ni_j

            if (accum_one > 1) return false
        }

        if((accum_one == 1) ){
            for(let i = 0; i < this.P.length; i++){
                let Ni_j = temp[i]
                let point = this.P[i]
                let [x, y] = point
                accum_x += x * Ni_j
                accum_y += y * Ni_j
        
            }
        }else{return false}

        return [accum_x, accum_y]
    }

    highlight_at(ctx, coor, radius, colour = 'red'){

        ctx.beginPath()
            ctx.arc(coor[0], coor[1], radius * 2, 0, 2 * Math.PI)
            ctx.strokeStyle = colour
            ctx.fillStyle = colour
            ctx.fill()
            ctx.stroke()
        ctx.closePath()
    }

    drawSpline(canvas, rig = true, colour = 'black', grain = Math.max(2 / (canvas.height + canvas.width), 0.0001)){ 

        let dist = this.distance(1)
        let ctx = canvas.getContext("2d")

        let window_scaleX = canvas.width / (Math.abs(this.max) + Math.abs(this.min) + 1)
        let window_scaleY = (canvas.height) / this.distance()
        ctx.translate(window_scaleX * (Math.abs(this.min)), canvas.height / 2 + dist * window_scaleY)
        ctx.clearRect(canvas.width, canvas.height, -canvas.width, -canvas.height)

        if(rig){
            let radius =  Math.max(window_scaleX / 20, 1)
            this.highlight_at(ctx, [0, 0], radius)
            ctx.beginPath()
            for(let p = 0; p < this.P.length; p++){

                let point = this.P[p]
                let [x, y] = point
                ctx.arc((x * window_scaleX), (-y) * window_scaleY, radius, Math.PI / 2, 2 * Math.PI + Math.PI / 2)
                ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.4)'
                }
            
            ctx.stroke()
            ctx.closePath()
        }

        for(let t = 0; t <= this.knots[this.knots.length - 1]; t+= grain){

            let point = this.calcSpline_at(t)
            if(!point)continue
            let [x, y] = point
            // if((x == t))console.log(y)
            ctx.beginPath()
            ctx.arc(x * window_scaleX, (-y) * window_scaleY, 0.5, 0, 2 * Math.PI)
            ctx.strokeStyle = colour
            ctx.stroke()
            ctx.closePath()
        }
    }
    split_grid_at(inter){

        const f = this.P[inter[0]], s = this.P[inter[1]]
        if((f != undefined) && (s != undefined)){
            
            let [X, Y] = f
            let [x, y] = s
            this.P.splice([inter[0]], 0, [(X + x) / 2, (Y + y) / 2])
            
            this.auto_generate_knots()
        }
    }
}




