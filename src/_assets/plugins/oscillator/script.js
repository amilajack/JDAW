function(data)
{
	let sampleRate = data.s
	let bufferSize = data.b
	let TAU440 = TAU * 400

	return d => self[d.c.wave](TAU440 * d.t * pow(2,(d.n-69+d.c.cents/100)/12) ) * exp(-max(d.t-d.d,0)*10)
}