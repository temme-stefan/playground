registerPaint('crossed', class {

    static get inputProperties() { return ['--crossColor']; }

    static get inputArguments() { return ['*','<length>']; }

    paint(ctx,size,properties){

        const theColor = props.get( '--crossColor' );
        const strokeType = properties?.[0].toString() ?? 'stroke';
        const strokeWidth = parseInt(args?.[1] ?? 1.0);

        console.log(theColor,strokeType,strokeWidth);

        ctx.lineWidth = strokeWidth;

        if ( strokeType === 'stroke' ) {
            ctx.fillStyle = 'transparent';
            ctx.strokeStyle = theColor;
        } else if ( strokeType === 'filled' ) {
            ctx.fillStyle = theColor;
            ctx.strokeStyle = theColor;
        } else {
            ctx.fillStyle = 'none';
            ctx.strokeStyle = 'none';
        }

        ctx.beginPath();
        ctx.moveTo( 0, 0 );
        ctx.lineTo( size.width, size.height);
        ctx.moveTo( size.width, 0 );
        ctx.lineTo( 0, size.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

    }

});
