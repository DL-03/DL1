const _body={
  enableInv:true,
  dumpToggle:true,
  drawSelect(tile){
    if(!this.enableInv){
      return;
    }
    var index=0;
    var a=this.itemList.length;
    var c=this.size+2+(this.size+1)%2;
    for(i=0;i<Math.ceil(a/c);i++){
      var b=c;
      if(i==parseInt(a/c)){
        b=a%c;
      }
      for(var j=0;j<b;j++){
        Draw.rect(this.itemList[index].icon(Cicon.xlarge),tile.drawx()-Math.floor(b/2)*8+j*8,tile.drawy()+(this.size+2)*4-8*i,8,8);
        this.drawPlaceText(tile.entity.getItemStat()[index],tile.x-Math.floor(b/2)+j,tile.y-i,true);
        index++;
      }
    }
  },
  checkinput(tile,i){
    const entity=tile.ent();
    var bs=false;
    if(this.input[i][0][0]!=null){
      for(var j=0;j<this.input[i][0].length;j++){
        bs|=entity.items.get(this.input[i][0][j].item)<this.input[i][0][j].amount;
      }
    }
    if(this.input[i][1][0]!=null){
      for(var j=0;j<this.input[i][1].length;j++){
        bs|=entity.liquids.get(this.input[i][1][j].liquid)<this.input[i][1][j].amount;
      }
    }
    return bs;
  },
  checkoutput(tile,i){
    const entity=tile.ent();
    var bs_=false;
    if(this.output[i][0][0]!=null){
      for(var j=0;j<this.output[i][0].length;j++){
        bs_|=entity.items.get(this.output[i][0][j].item)+this.output[i][0][j].amount>this.itemCapacity;
      }
    }
    if(this.output[i][1][0]!=null){
      for(var j=0;j<this.output[i][1].length;j++){
        bs_|=entity.liquids.get(this.output[i][1][j].liquid)+this.output[i][1][j].amount>this.liquidCapacity;
      }
    }
    return bs_;
  },
  checkCond(tile,i){
    const entity=tile.ent();
    if(entity.getToggle()==i){
      if(this.checkoutput(tile,i)){
        return false;
      }
      else if(this.checkinput(tile,i)){
        return false;
      }
      else if(this.hasPower==true&&entity.power.status<=0&&this.input[i][2]!=null){
        return false;
      }else{
        return true;
      }
    }
  },
  customCons(tile,i){
    const entity=tile.ent();
    entity.saveCond(this.checkCond(tile,i));
    if(this.checkCond(tile,i)){
      if(entity.getProgress(i)!=0&&entity.getProgress(i)!=null){
        entity.progress=entity.getProgress(i);
        entity.saveProgress(i,0);
      }
      entity.progress+=this.getProgressIncrease(entity,this.craftTimes[i]);
      entity.totalProgress+=entity.delta();
      entity.warmup=Mathf.lerpDelta(entity.warmup,1,0.02);

      if(Mathf.chance(Time.delta()*this.updateEffectChance)){
        Effects.effect(this.updateEffect,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }else{
      entity.warmup=Mathf.lerp(entity.warmup,0,0.02);
    }
  },
  acceptItem(item,tile,source){
    const entity=tile.ent();
    var _bs=false;
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][0][0]!=null){
        for(var j=0;j<this.input[i][0].length;j++){
          _bs|=item==this.input[i][0][j].item?true:false;
        }
      }
    }
    return _bs&&entity.items.get(item)<this.itemCapacity;
  },
  acceptLiquid(tile,source,liquid,amount){
    const entity=tile.ent();
    var _Bs=false;
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][1][0]!=null){
        for(var j=0;j<this.input[i][1].length;j++){
          _Bs|=liquid==this.input[i][1][j].liquid?true:false;
        }
      }
    }
    return _Bs&&entity.liquids.get(liquid)+amount<this.liquidCapacity;
  },
  displayConsumption(tile,table){
    const entity=tile.ent();
    var z=0;
    var y=0;
    var x=0;
    table.left();
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][0][0]!=null){
        for(var j=0;j<this.input[i][0].length;j++){
          (function (i,j,input){
          var item=input[i][0][j].item
          var amount=input[i][0][j].amount
          table.add(new ReqImage(new ItemImage(item.icon(Cicon.medium),amount),boolp(()=>entity!=null&&entity.items.has(item,amount)&&entity.items!=null))).size(8*4);
        })(i,j,this.input)
        }
        z+=this.input[i][0].length;
      }
      if(this.input[i][1][0]!=null){
        for(var l=0;l<this.input[i][1].length;l++){
          (function (i,l,input){
            var liquid=input[i][1][l].liquid;
            var amount=input[i][1][l].amount;
            table.add(new ReqImage(new ItemImage(liquid.icon(Cicon.medium),amount),boolp(()=>entity!=null&&entity.liquids.get(liquid)>amount&&entity.liquids!=null))).size(8*4);
          })(i,l,this.input)
        }
        z+=this.input[i][1].length;
      }
      if(z==0){
        table.addImage(Icon.cancel).size(8*4);
        x+=1;
      }
      if(this.input[i+1]!=null){
        if(this.input[i+1][0][0]!=null){
          y+=this.input[i+1][0].length;
        }
        if(this.input[i+1][1][0]!=null){
          y+=this.input[i+1][1].length;
        }
        x+=z;
        if(x+y<=7&&y!=0){
          table.addImage(Icon.pause).size(8*4);
          x+=1;
        }else if(x+y<=6&&y==0){
          table.addImage(Icon.pause).size(8*4);
          x+=1;
        }else{
          table.row();
          x=0;
        }
      }
      y=0;
      z=0;
    }
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.powerUse);
    this.stats.remove(BlockStat.productionTime);
    for(var i=0;i<this.craftTimes.length;i++){
      this.stats.add(BlockStat.productionTime,i+1,StatUnit.none);
      this.stats.add(BlockStat.productionTime,this.craftTimes[i]/60,StatUnit.seconds);
    }
    for(var j=0;j<this.output.length;j++){
      this.stats.add(BlockStat.output,j+1,StatUnit.none);
      if(this.output[j][0][0]!=null){
        for(var jj=0;jj<this.output[j][0].length;jj++){
          this.stats.add(BlockStat.output,this.output[j][0][jj]);
        }
      }
      if(this.output[j][1][0]!=null){
        for(var jj=0;jj<this.output[j][1].length;jj++){
          this.stats.add(BlockStat.output,this.output[j][1][jj].liquid,this.output[j][1][jj].amount,false);
        }
      }
    }
    for(var k=0;k<this.input.length;k++){
      this.stats.add(BlockStat.input,k+1,StatUnit.none);
      if(this.input[k][0][0]!=null){
        for(var l=0;l<this.input[k][0].length;l++){
          this.stats.add(BlockStat.input,this.input[k][0][l]);
        }
      }
      if(this.input[k][1][0]!=null){
        for(var l=0;l<this.input[k][1].length;l++){
          this.stats.add(BlockStat.input,this.input[k][1][l].liquid,this.input[k][1][l].amount,false);
        }
      }
    }
    for(var ii=0;ii<this.output.length;ii++){
      if(this.output[ii][2]!=null){
        this.stats.add(BlockStat.basePowerGeneration,ii+1,StatUnit.none);
        this.stats.add(BlockStat.basePowerGeneration,this.output[ii][2]*60,StatUnit.powerSecond);
      }else{
        this.stats.add(BlockStat.basePowerGeneration,ii+1,StatUnit.none);
        this.stats.add(BlockStat.basePowerGeneration,0,StatUnit.powerSecond);
      }
    }
    for(var l=0;l<this.input.length;l++){
      if(this.input[l][2]!=null){
        this.stats.add(BlockStat.powerUse,l+1,StatUnit.none);
        this.stats.add(BlockStat.powerUse,this.input[l][2]*60,StatUnit.powerSecond);
      }else{
        this.stats.add(BlockStat.powerUse,l+1,StatUnit.none);
        this.stats.add(BlockStat.powerUse,0,StatUnit.powerSecond);
      }
    }
  },
  setBars(){
    this.super$setBars();
    this.bars.remove("liquid");
    this.bars.remove("items");
    var powerBarI=false;
    var powerBarO=false;
    for(var i=0;i<this.output.length;i++){
      if(this.output[i][2]!=null){
        powerBarO|=true;
      }
    }
    if(powerBarO){
      this.outputsPower=true;
      this.bars.add("poweroutput",func(entity=>
        new Bar(prov(()=>Core.bundle.format("bar.poweroutput",entity.block.getPowerProduction(entity.tile)*60)),prov(()=>Pal.powerBar),floatp(()=>entity.tile.entity!=null?entity.tile.entity.getPowerStat():0))
      ));
    }else if(!powerBarI){
      this.outputsPower=true;
    }else{
      this.outputsPower=false;
    }
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][2]!=null){
        powerBarI|=true;
      }
    }
    if(!powerBarI){
      this.bars.remove("power");
    }
    if(this.itemList[0]!=null){
      (function(itemCapacity,itemList,bars){
        bars.add("items",func(entity=>
          new Bar(prov(()=>Core.bundle.format("bar.items",entity.tile.entity.getItemStat().join('/')))
          ,prov(()=>Pal.items)
          ,floatp(()=>entity.items.total()/(itemCapacity*itemList.length)))
        ));
      })(this.itemCapacity,this.itemList,this.bars)
    }
    if(this.liquidList[0]!=null){
      for(var i=0;i<this.liquidList.length;i++){
        (function(i,liquidList,liquidCapacity,bars){
          bars.add("liquid"+i,func(entity=>
            new Bar(prov(()=>liquidList[i].localizedName),prov(()=>liquidList[i].barColor()),floatp(()=>entity.liquids.get(liquidList[i])/liquidCapacity))
          ));
        })(i,this.liquidList,this.liquidCapacity,this.bars)
      }
    }
  },
  getProgressIncrease(entity,baseTime){
    for(var i=0;i<this.input.length;i++){
      if(baseTime==this.craftTimes[i]&&this.input[i][2]!=null){
        return this.super$getProgressIncrease(entity,baseTime);
      }
      else if(baseTime==this.craftTimes[i]){
        return 1/baseTime*entity.delta();
      }
    }
  },
  getPowerProduction(tile){
    const entity=tile.ent();
    for(var i=0;i<this.output.length;i++){
      if(entity.getToggle()==i&&this.output[i][2]!=null&&entity.getCond()){
        if(this.input[i][2]!=null){
          entity.setPowerStat(entity.efficiency());
          return this.output[i][2]*entity.efficiency();
        }
        else{
          entity.setPowerStat(1);
          return this.output[i][2];
        }
      }
    }
    entity.setPowerStat(0);
    return 0;
  },
  customProd(tile,i){
    const entity=tile.ent();
    if(this.input[i][0][0]!=null){
      for(var k=0;k<this.input[i][0].length;k++){
        entity.items.remove(this.input[i][0][k]);
      }
    }
    if(this.input[i][1][0]!=null){
      for(var j=0;j<this.input[i][1].length;j++){
        entity.liquids.remove(this.input[i][1][j].liquid,this.input[i][1][j].amount);
      }
    }
    if(this.output[i][0][0]!=null){
      for(var a=0;a<this.output[i][0].length;a++){
        this.useContent(tile,this.output[i][0][a].item);
        for(var aa=0;aa<this.output[i][0][a].amount;aa++){
          this.offloadNear(tile,this.output[i][0][a].item);
        }
      }
    }
    if(this.output[i][1][0]!=null){
      for(var j=0;j<this.output[i][1].length;j++){
        this.useContent(tile,this.output[i][1][j].liquid);
        this.handleLiquid(tile,tile,this.output[i][1][j].liquid,this.output[i][1][j].amount);
      }
    }
    Effects.effect(this.craftEffect,tile.drawx(),tile.drawy());
    entity.progress=0;
  },
  shouldIdleSound(tile){
    return tile.entity.getCond()
  },
  update(tile){
    const entity=tile.ent();
    for(var i=0;i<this.itemList.length;i++){
      entity.getItemStat()[i]=entity.items.get(this.itemList[i]);
    }
    for(var z=0;z<this.input.length;z++){
      if(entity.getToggle()==z){
        this.customCons(tile,z);
        if(entity.getToggle()==z&&entity.progress>=1){
          this.customProd(tile,z);
        }
        break;
      }
    }
    var exitI=false;
    var exitL=false;
    if(entity.getToggle()!=this.input.length){
      if(entity.timer.get(this.timerDump,this.dumpTime)){
        for(var ii=0;ii<this.output.length;ii++){
          if(this.output[ii][0][0]!=null){
            for(var ij=0;ij<this.output[ii][0].length;ij++){
              if(entity.items.get(this.output[ii][0][ij].item)>0&&((!this.dumpToggle)||entity.getToggle()==ii)){
                this.tryDump(tile,this.output[ii][0][ij].item);
                exitI=true;
                break;
              }
            }
            if(exitI){
              exitI=false;
              break;
            }
          }
        }
      }
      for(var jj=0;jj<this.output.length;jj++){
        if(this.output[jj][1][0]!=null){
          for(var i=0;i<this.output[jj][1].length;i++){
            if(entity.liquids.get(this.output[jj][1][i].liquid)>0.001&&((!this.dumpToggle)||entity.getToggle()==jj)){
              this.tryDumpLiquid(tile,this.output[jj][1][i].liquid);
              exitL=true;
              break;
            }
          }
          if(exitL){
            exitL=false;
            break;
          }
        }
      }
    }
    else if(entity.getToggle()==this.input.length){
      if(entity.timer.get(this.timerDump,this.dumpTime)&&entity.items.total()>0){
        this.tryDump(tile);
      }
      if(entity.liquids.total()>0){
        for(var i=0;i<this.liquidList.length;i++){
          if(entity.liquids.get(this.liquidList[i])>0.01){
            this.tryDumpLiquid(tile,this.liquidList[i]);
            break;
          }
        }
      }
    }
  },
  init(){
    for(var i=0;i<this._output.length;i++){
      if(this.output[i]==null)  this.output[i]=[];
      this.output[i][2]=this._output[i][2];
    }
    for(var i=0;i<this._input.length;i++){
      if(this.input[i]==null) this.input[i]=[];
      this.input[i][2]=this._input[i][2];
    }
    for(var i=0;i<this._output.length;i++){
      this.output[i][0]=[];
      this.output[i][1]=[];
      if(this._output[i][0]!=null){
        var index=0;
        for(var j=0;j<this._output[i][0].length;j++){
          if(this._output[i][0][j]!=null){
            this.output[i][0][index]=ItemStack(Vars.content.getByName(ContentType.item,this._output[i][0][j][0]),this._output[i][0][j][1]);
            index++;
          }
        }
      }
      if(this._output[i][1]!=null){
        var index=0;
        for(var j=0;j<this._output[i][1].length;j++){
          if(this._output[i][1][j]!=null){
            this.output[i][1][index]=LiquidStack(Vars.content.getByName(ContentType.liquid,this._output[i][1][j][0]),this._output[i][1][j][1]);
            index++;
          }
        }
      }
    }
    for(var i=0;i<this._input.length;i++){
      this.input[i][0]=[];
      this.input[i][1]=[];
      if(this._input[i][0]!=null){
        var index=0;
        for(var j=0;j<this._input[i][0].length;j++){
          if(this._input[i][0][j]!=null){
            this.input[i][0][index]=ItemStack(Vars.content.getByName(ContentType.item,this._input[i][0][j][0]),this._input[i][0][j][1]);
            index++;
          }
        }
      }
      if(this._input[i][1]!=null){
        var index=0;
        for(var j=0;j<this._input[i][1].length;j++){
          if(this._input[i][1][j]!=null){
            this.input[i][1][index]=LiquidStack(Vars.content.getByName(ContentType.liquid,this._input[i][1][j][0]),this._input[i][1][j][1]);
            index++;
          }
        }
      }
    }
    var _itemList=[];
    var indexI=0;
    for(var i=0;i<this.output.length;i++){
      if(this.output[i][0][0]!=null){
        for(var j=0;j<this.output[i][0].length;j++){
          _itemList[indexI]=this.output[i][0][j].item;
          indexI++;
        }
      }
    }
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][0][0]!=null){
        for(var j=0;j<this.input[i][0].length;j++){
          _itemList[indexI]=this.input[i][0][j].item;
          indexI++;
        }
      }
    }
    var indexI_=0;
    for(var i=0;i<_itemList.length;i++){
      if(_itemList.indexOf(_itemList[i])!=i){
      }else{
        this.itemList[indexI_]=_itemList[i];
        indexI_++;
      }
    }
    var _liquidList=[];
    var indexL=0;
    for(var i=0;i<this.output.length;i++){
      if(this.output[i][1][0]!=null){
        for(var j=0;j<this.output[i][1].length;j++){
          _liquidList[indexL]=this.output[i][1][j].liquid;
          indexL++;
        }
      }
    }
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][1][0]!=null){
        for(var j=0;j<this.input[i][1].length;j++){
          _liquidList[indexL]=this.input[i][1][j].liquid;
          indexL++;
        }
      }
    }
    var indexL_=0;
    for(var i=0;i<_liquidList.length;i++){
      if(_liquidList.indexOf(_liquidList[i])!=i){
      }else{
        this.liquidList[indexL_]=_liquidList[i];
        indexL_++;
      }
    }
    var sortO=[];
    for(var i=0;i<this._output.length;i++){
      var index=0;
      if(sortO[i]==null) sortO[i]=[];
      if(this._output[i][0]!=null){
        for(var j=0;j<this._output[i][0].length;j++){
          if(this._output[i][0][j]!=null){
            sortO[i][index]=this._output[i][0][j].join('');
            index++;
          }
        }
      }
      if(this._output[i][1]!=null){
        for(var j=0;j<this._output[i][1].length;j++){
          if(this._output[i][1][j]!=null){
            sortO[i][index]=this._output[i][1][j].join('');
            index++;
          }
        }
      }
      sortO[i][index]=this._output[i][2];
    }
    var c=[];
    for(var k=0;k<sortO.length;k++){
      if(c[k]==null){
        c[k]=[];
        for(var p=0;p<sortO.length;p++){
          c[k][p]=true;
        }
      }
      for(var l=0;l<sortO[k].length;l++){
        for(var n=0;n<sortO.length;n++){
          var r=false;
          for(var q=0;q<sortO[n].length;q++){
            r|=(sortO[n][q]==sortO[k][l]&&sortO[n].length==sortO[k].length);
          }
          c[k][n]&=r
        }
      }
    }
    var e=[];
    for(var m=0;m<sortO.length;m++){
      if(sortO[m][0]==null){
        e[m]=true;
      }else{
        e[m]=false;
      }
    }
    for(var m=0;m<sortO.length;m++){
      if(sortO[m][0]==null){
        c[m]=e;
      }
    }
    this.isSameOutput=c;
    this.super$init();
  },
  setCheckButton(a,z,tile){
    const entity=tile.ent();
    if(a==-1){
      return false;
    }
    else if(a==this.output.length&&z==this.output.length){
      return true;
    }else if(a==this.output.length&&z!=this.output.length){
      return false;
    }
    var d=[];
    for(var j=0;j<this.isSameOutput[a].length;j++){
      if(this.isSameOutput[a][j]==true){
        d[j]=j;
      }else{
        d[j]=-10;
      }
    }
    if(d.includes(z)&&d[z]!=-10&&d[z]!=null){
      return true;
    }else{
      return false;
    }
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    var group=new ButtonGroup();
    group.setMinCheckCount(0);
    group.setMaxCheckCount(-1);
    var output=this.output;
    for(var i=0;i<this.input.length+1;i++){
      (function (i,tile){
        var button=table.addImageButton(Tex.whiteui,Styles.clearToggleTransi,40,run(()=>tile.configure(button.isChecked()?i:-1))).group(group).get();
        button.getStyle().imageUp=new TextureRegionDrawable(i!=output.length?output[i][0][0]!=null?output[i][0][0].item.icon(Cicon.small):output[i][1][0]!=null?output[i][1][0].liquid.icon(Cicon.small):output[i][2]!=null?Icon.power:Icon.cancel:Icon.trash);
        button.update(run(()=>button.setChecked(!tile.block().hasEntity()?false:tile.block().setCheckButton(entity.getToggle(),i,tile))));
      })(i,tile)
    }
    table.row();
    var lengths=[];
    var max=0;
    for(var l=0;l<this.output.length;l++){
      if(lengths[l]==null) lengths[l]=[0,0,0];
      if(this.output[l][0][0]!=null) lengths[l][0]=this.output[l][0].length-1;
      if(this.output[l][1][0]!=null) lengths[l][1]=this.output[l][1].length;
      if(this.output[l][2]!=null) lengths[l][2]=1;
    }
    for(var i=0;i<lengths.length;i++){
      max=max<lengths[i][0]+lengths[i][1]+lengths[i][2]?lengths[i][0]+lengths[i][1]+lengths[i][2]:max;
    }
    for(var i=0;i<max;i++){
      for(var j=0;j<this.output.length;j++){
        if(lengths[j][0]>0){
          table.addImage(this.output[j][0][this.output[j][0].length-lengths[j][0]].item.icon(Cicon.small));
          lengths[j][0]--;
        }else if(lengths[j][1]>0){
          table.addImage(this.output[j][1][this.output[j][1].length-lengths[j][1]].liquid.icon(Cicon.small));
          lengths[j][1]--;
        }else if(lengths[j][2]>0){
          if(output[j][0][0]!=null||output[j][1][0]!=null){
            table.addImage(Icon.power);
          }else table.addImage(Tex.clear);
          lengths[j][2]--;
        }else{
          table.addImage(Tex.clear);
        }
      }
      table.row();
    }
  },
  configured(tile,player,value){
    const entity=tile.ent();
    for(var i=0;i<this.input.length;i++){
      if(entity.getToggle()==i){
        entity.saveProgress(entity.getToggle(),entity.progress);
        break;
      }
    }
    entity.progress=0;
    entity.modifyToggle(value);
  }
}
module.exports={
  body:_body,
}