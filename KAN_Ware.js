
function random(X, Y = -X, p = 3){

    let min = Math.min(X, Y)
    let max = Math.max(X, Y)

    let val = (Math.random() * (max + 1 - min)) + min
    if(val > max)return max
    return parseFloat(val.toFixed(p))
}

function random_exc(exclude, x, y = -x, p = 3){
    if(!((x == exclude) && (y == exclude))){    
        let temp = random(x, y, p)
        while(temp == exclude){
            temp = random(x, y, p)
        }
        return temp
    }else{
        return false
    }
}

class KAN {

    constructor(id, layers, in_range, recurrent = false){
        this.layers = layers
        this.create_nodes = () =>{ //[[[id, value], [id,...]]]
            let result = []
            for(let j = 0; j < this.layers.length; j++){
                let l = this.layers[j]
                let layer_i = []
                for(let i = 0; i < l; i++){
                    layer_i.push([i, 0])
                }
                result.push(layer_i)
            }
            return result
        }
        this.nodes = this.create_nodes()
        this.act_funcs = []      //[[layer, input_id], [layer, output_id], BSpline, [thershold, rate]]
        this.recurrent = recurrent
        this.range = in_range
        this.max = Math.max(...in_range)
        this.min = Math.min(...in_range)
        this.id = id
    }

    check_act_dup(in_, out_){
        for(let a of this.act_funcs){
            if(arr_equal(a[0], in_) && arr_equal(a[1], out_))return true
        }return false

    }
    add_node(_layer){
        let group = this.nodes[_layer]
        this.layers[_layer]++
        group.push([group.length, 0])
    }
    add_layer(pos, num = 1){
        let temp = []
        for(let i = 0; i < num; i++){
            temp.push([i, 0])
        }
        this.nodes.splice(pos, 0, temp)
        this.layers.splice(pos, 0, num)

    }
    sort_act_funcs(asce = 1){
        this.act_funcs.sort((a, b) => asce * a[0] - asce * b[0])
    }

    init_forward_conn(percent = .35, freq = 0.5, k_range = [1, 4]){  // freq = 1 = false

        // let this.nodes = this.create_nodes()

        for(let l = 1; l < this.nodes.length; l++){

            let front = this.nodes[l]
            let back = this.nodes[l - 1]
            let max_conn = front.length * back.length * (percent >= 1 ? 1 : percent)
            for(let count = 0; count < max_conn; count++){

                let i = back[random(0, back.length - 1, 0)]
                let o = front[random(0, front.length - 1, 0)]
                let i_i = i[0], o_i = o[0]

                if(!this.check_act_dup([l - 1, i_i], [l, o_i])){    
                    
                    let temp = []
                    let _k = random(k_range[0], k_range[1], 0)
                    let final_n = _k + random(1, 6, 0)

                    for(let p = 0; p < final_n; p++){
                        if(p == 0){
                            temp.push([this.min, 0])
                        }else if(p == final_n - 1){
                            temp.push([this.max, 0])
                        }else{
                            temp.push([random(this.min, this.max, 3), 0])
                        }
                    }

                    let b_Spline = new BSpline(_k, temp, this.range, random(0, 1, 2) > freq)

                    for(let m = 0; m < 6; m++){
                        let perc = random(0, 1, 2)
                            if(perc < 0.67){0
                                b_Spline.shift_Point(random(1, b_Spline.P.length - 1, 0), random(this.max, 2), random(0, 1, 2) < 0.5 ? 0 : 1)
                                b_Spline.auto_generate_knots()

                            }else if(perc < .9){
                                b_Spline.add_Point([random(this.min, this.max, 2), random(this.min, this.max, 2)], random(0, 1, 2) < 0.5 ? false : random(1, b_Spline.P.length - 1, 0))
                                b_Spline.auto_generate_knots()

                            }else if(b_Spline.P.length > _k + 1){
                                b_Spline.remove_Point(random(0, b_Spline.P.length - 1, 0))
                                b_Spline.auto_generate_knots()
                            }
                    }
                    this.act_funcs.push([[l - 1, i_i], [l, o_i], b_Spline])
                
                }else{
                    count--
                }
                
            }
        }

    }
    
    pass_(inputs){

        this.sort_act_funcs()
        for(let i_ of this.nodes[0]){
            i_[1] += inputs[i_[0]]
        }
        for(let conn of this.act_funcs){
            let [start, end, spline,...thershold] = conn
            let [lay_i, i_i] = start, [lay_o, i_o] = end

            let temp_o = this.nodes[lay_o][i_o][1]
            var output = spline.calcSpline_at(this.nodes[lay_i][i_i][1]) 
            if(!output)continue
            this.nodes[lay_o][i_o][1] += Math.max(Math.min(output[1] + temp_o, this.max), this.min)
        }
    }

    draw_act_func(coor, act_func, b_view = 50){
        let b_canvas = document.createElement('canvas')
        let scale = 3
        // b_canvas.
        b_canvas.setAttribute('style', `
            background-color: grey;
            position: relative;
            left: ${coor[0]}px;
            top:  ${coor[1] * b_view}px;
            margin: 5px;
            `);
        b_canvas.height = b_view
        b_canvas.width = b_view
        b_canvas.addEventListener("click", () =>{
            // console.clear()
            console.log(act_func)
            
        })
        b_canvas.addEventListener("mouseenter", () =>{
            
            b_canvas.height = b_view * scale
            b_canvas.width = b_view * scale     
            b_canvas.addEventListener("scroll", (s) =>{

                // console.log(s.target)
            })
            act_func.drawSpline(b_canvas, true)

        })
        b_canvas.addEventListener("mouseleave", () =>{
            b_canvas.height = b_view
            b_canvas.width = b_view
            b_canvas.removeEventListener("scroll", () =>{})
            act_func.drawSpline(b_canvas, true)

        })
        act_func.drawSpline(b_canvas, true)

        document.querySelector(`#${this.id}.KAN-container`).appendChild(b_canvas); 
    }

    draw_KAN(coor = [0, 0]){
        if(this.container != undefined)document.querySelector('body').removeChild(this.container)
        this.container = document.createElement('div')
        this.container.setAttribute('class', `
            KAN-container
            `)
        this.container.setAttribute('id', `${this.id}`)
        this.container.setAttribute('style', `
            width: fit-content;
            height: fit-content;
            position: absolute;
            left: ${coor[0]}px;
            top:  ${coor[1]}px;
            `)
        document.querySelector('body').appendChild(this.container)

        for(let i = 0; i < this.act_funcs.length; i++){
            let a = this.act_funcs[i]
            this.draw_act_func([i, a[0][0]], a[2], 40)
        }
    }
}

var test_KAN = new KAN('test', [9, 2], [-1, 1])
test_KAN.init_forward_conn(1)
test_KAN.draw_KAN()