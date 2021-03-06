const furnace=multiLib.extend(GenericSmelter,GenericCrafter.GenericCrafterEntity,"forge2",{
},{
_output:[
[[["copper",1]],null,null],
[[["lead",1]],null,null],
[[["dl1-aluminum",1]],null,null],
],
_input:[
[[["dl1-copper-ore",5],["coal",5]],null,null],
[[["dl1-lead-ore",5],["coal",5]],null,null],
[[["dl1-aluminum-ore",5],["coal",5]],null,null],
],
craftTimes:[250,225,200],
//DON'T MODIFY THESE
output:[],
input:[],
itemList:[],
liquidList:[],
isSameOutput:[],
});
furnace.enableInv=false;
furnace.dumpToggle=false;
furnace.localizedName="Multi Forge 1 lvl";
furnace.description="...";
furnace.itemCapacity= 10;
furnace.liquidCapacity= 0;
furnace.size= 2;
furnace.health= 500;
furnace.craftEffect= Fx.pulverizeMedium;
furnace.updateEffect=Fx.plasticburn;
