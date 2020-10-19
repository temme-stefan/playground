class Crossed{

    static get inputProperties() { return ['--crossColor','--crossThickness']; }
    //
    // 2020-10-19 not supported so far
    // static get inputArguments() { return ['*','<length>']; }

    paint(ctx,size,properties){

        const theColor = ""+(properties.get( '--crossColor' ) ?? "white");
        const strokeWidth = parseInt(properties.get( '--crossThickness' ) ?? 1);

        console.debug(properties,size,theColor,strokeWidth);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = theColor;

        ctx.beginPath();
        ctx.moveTo( 0, 0 );
        ctx.lineTo( size.width, size.height);
        ctx.moveTo( size.width, 0 );
        ctx.lineTo( 0, size.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

    }

}

registerPaint('crossed', Crossed );